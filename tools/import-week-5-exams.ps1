param(
  [string]$SourceDir
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$repo = Split-Path -Parent $PSScriptRoot
if (-not $SourceDir) {
  $externalSourceDir = "E:\tool\01. CODE\02 fnsofphn\project content\de tuan 5"
  $SourceDir = if (Test-Path -LiteralPath $externalSourceDir) {
    $externalSourceDir
  } else {
    Join-Path $repo "project content\De thi giup Cy\de tuan 5"
  }
}

$publicRoot = Join-Path $repo "public\exam-assets\week-5"
$dataPath = Join-Path $repo "features\giup-cy\week-5-exams.json"
$assetPath = Join-Path $repo "features\giup-cy\week-5-assets.json"

$w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
$a = "http://schemas.openxmlformats.org/drawingml/2006/main"
$r = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

$cauPattern = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Q8OidQ=="))
$sectionIText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("UGjhuqduIEk="))
$sectionIIText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("UGjhuqduIElJ"))
$sectionIIIText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("UGjhuqduIElJSQ=="))
$questionReviewText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("xJDhu4EgxJHGsOG7o2Mgbmjhuq1wIHThu6sgV29yZCB0deG6p24gMzsgxJHDoXAgw6FuIGPhuqduIHLDoCBzb8OhdCB0aOG7pyBjw7RuZyB0csaw4bubYyBraGkgZMO5bmcgxJHhu4MgY2jhuqVtIHRo4bqtdC4="))
$examDescriptionText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("xJDhu4EgdHXhuqduIDMgxJHGsOG7o2Mgbmjhuq1wIHThu6sgZmlsZSBXb3JkIGfhu5FjLiBDw6FjIGPDonUgY8OzIGPDtG5nIHRo4bupYy9ow6xuaCDEkcaw4bujYyBnaeG7ryBuaMO6bmcgdOG7qyBXb3JkOyDEkcOhcCDDoW4gxJFhbmcgxJHhu4MgcsOgIHNvw6F0IMSR4buDIHRyw6FuaCBjaOG6pW0gc2FpLg=="))
$chemistrySubjectText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("SMOzYSBo4buNYw=="))

function Normalize-Text([string]$value) {
  if ($null -eq $value) { return "" }
  return ($value -replace "\s+", " ").Trim()
}

function Is-SectionHeading([string]$value) {
  return $value -match "PH.{0,3}N\s*(I|II|III)\b"
}

function Get-WordParagraphTexts([string]$path) {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $doc = $null
  try {
    $doc = $word.Documents.Open($path, $false, $true)
    $items = New-Object System.Collections.Generic.List[string]
    for ($i = 1; $i -le $doc.Paragraphs.Count; $i++) {
      $text = $doc.Paragraphs.Item($i).Range.Text
      $text = $text -replace "[\r\a]", " "
      $text = $text -replace "[\x00-\x08\x0B\x0C\x0E-\x1F]", ""
      $items.Add($text)
    }
    return $items.ToArray()
  } finally {
    if ($doc -ne $null) { $doc.Close($false) | Out-Null }
    $word.Quit() | Out-Null
    [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  }
}

function Get-Slug([string]$name) {
  $normalized = $name.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
  $chars = New-Object System.Text.StringBuilder
  foreach ($ch in $normalized.ToCharArray()) {
    $category = [Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($category -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
      [void]$chars.Append($ch)
    }
  }
  $ascii = $chars.ToString() -replace "Ä‘", "d"
  return (($ascii -replace "[^a-z0-9]+", "-").Trim("-"))
}

function Get-QuestionKind([string]$section, [int]$localNumber) {
  if ($localNumber -eq 18) { return "single_choice" }
  if ($section -eq $sectionIText -and $localNumber -le 18) { return "single_choice" }
  if ($section -eq $sectionIIText -or ($localNumber -ge 19 -and $localNumber -le 22)) { return "true_false" }
  return "short_answer"
}

function Get-GlobalNumber([string]$section, [int]$localNumber) {
  if ($localNumber -eq 18) { return 18 }
  if ($section -eq $sectionIText -and $localNumber -le 18) { return $localNumber }
  if ($localNumber -ge 19) { return $localNumber }
  if ($section -eq $sectionIIText) { return 18 + $localNumber }
  if ($section -eq $sectionIIIText) { return 22 + $localNumber }
  return $localNumber
}

function Split-Options([string[]]$lines) {
  $joined = ($lines -join "`n")
  $matches = [regex]::Matches($joined, "(?ms)([A-D])\.\s*(.*?)(?=([A-D])\.|$)")
  if ($matches.Count -ge 4) {
    $items = @()
    foreach ($m in $matches) {
      $items += [ordered]@{
        key = $m.Groups[1].Value
        text = (Normalize-Text $m.Groups[2].Value)
      }
    }
    return $items | Select-Object -First 4
  }

  if ($lines.Count -ge 4) {
    $tail = $lines | Select-Object -Last 4
    $keys = @("A", "B", "C", "D")
    $items = @()
    for ($i = 0; $i -lt 4; $i++) {
      $items += [ordered]@{ key = $keys[$i]; text = (Normalize-Text $tail[$i]) }
    }
    return $items
  }

  return @()
}

function Get-PromptWithoutOptions([string[]]$lines, [string]$kind) {
  if ($kind -eq "short_answer") { return (Normalize-Text ($lines -join "`n")) }
  if ($kind -eq "true_false" -and $lines.Count -gt 4) {
    return (Normalize-Text (($lines | Select-Object -First ($lines.Count - 4)) -join "`n"))
  }

  $joined = ($lines -join "`n")
  $firstOption = [regex]::Match($joined, "(?ms)A\.\s*")
  if ($firstOption.Success) {
    return (Normalize-Text $joined.Substring(0, $firstOption.Index))
  }

  if ($kind -eq "single_choice" -and $lines.Count -gt 4) {
    return (Normalize-Text (($lines | Select-Object -First ($lines.Count - 4)) -join "`n"))
  }

  return (Normalize-Text $joined)
}

function New-Question([string]$section, [int]$localNumber, [string[]]$lines, [int]$sortOrder) {
  $globalNumber = Get-GlobalNumber $section $localNumber
  $kind = Get-QuestionKind $section $globalNumber
  $options = @()
  if ($kind -eq "single_choice") {
    $options = @(Split-Options $lines)
  } elseif ($kind -eq "true_false") {
    $tail = if ($lines.Count -ge 4) { $lines | Select-Object -Last 4 } else { @() }
    $keys = @("a", "b", "c", "d")
    for ($i = 0; $i -lt [Math]::Min(4, $tail.Count); $i++) {
      $options += [ordered]@{ key = $keys[$i]; text = (Normalize-Text $tail[$i]) }
    }
  }

  $points = if ($kind -eq "single_choice") { 0.25 } elseif ($kind -eq "true_false") { 1 } else { 0.25 }
  return [ordered]@{
    section = $section
    question_number = $globalNumber
    question_type = $kind
    prompt = (Get-PromptWithoutOptions $lines $kind)
    options = $options
    correct_answer = $null
    points = $points
    needs_review = $true
    explanation = $questionReviewText
    sort_order = $sortOrder
  }
}

function Repair-Week3QuestionText([string]$sourceFileName, $questions) {
  if ((Get-Slug $sourceFileName) -notmatch "lang-son") { return $questions }

  foreach ($question in $questions) {
    if ($question.question_number -eq 1) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("TeG7mXQgZ8OzaSBsw6BtIG7Ds25nIHRo4bupYyDEg24gKEZSSCkgxJHGsOG7o2Mgc+G7rSBk4bulbmcgdHJvbmcgcXXDom4gxJHhu5lpIGNo4bupYSA4IGdhbSBo4buXbiBo4bujcCAoTWcgOTAlLCBGZSA0JSwgTmFDbCA2JSB24buBIGto4buRaSBsxrDhu6NuZyksIGtoaSB0aeG6v3AgeMO6YyB24bubaSBuxrDhu5tjIHPhur0geOG6o3kgcmEgcGjhuqNuIOG7qW5nOgpNZyhzKSArIDJIMk8obCkg4oaSIE1nKE9IKTIocykgKyAySDIoZykKQ2hvIGJp4bq/dDogUGjhuqNuIOG7qW5nIG7DoHkgdOG7j2EgcmEgbmhp4buBdSBuaGnhu4d0IHbDoCBsw6BtIG7Ds25nIHBo4bqnbiB0aOG7qWMgxINuIMSRaSBrw6htLiBFbnRoYWxweSB04bqhbyB0aMOgbmggY2h14bqpbiAoa0ogbW9sLTEpIGPhu6dhIE1nKE9IKTIocykgdsOgIEgyTyhsKSBs4bqnbiBsxrDhu6N0IGzDoCAtOTI4LDQgdsOgIC0yODUsOC4gTmhp4buHdCBkdW5nIHJpw6puZyBj4bunYSBuxrDhu5tjLCBDID0gNCwyIEogZy0xIEstMTsga2jhu5FpIGzGsOG7o25nIHJpw6puZyBj4bunYSBuxrDhu5tjIGzDoCBEID0gMSBnL21MLiBQaOG6p24gbsaw4bubYyDEkcaw4bujYyBsw6BtIG7Ds25nIGNo4buJIG5o4bqtbiDEkcaw4bujYyB04buRaSDEkWEgNjAlIGzGsOG7o25nIG5oaeG7h3QgdOG7j2EgcmEuIEzGsOG7o25nIG5oaeG7h3QgbcOgIG7GsOG7m2Mgbmjhuq1uIMSRxrDhu6NjIMSR4buDIHRoYXkgxJHhu5VpIM6UdCAowrBDKSDEkcaw4bujYyB0w61uaCB0aGVvIGPDtG5nIHRo4bupYyBRID0gbS5DLs6UdC4gTuG6v3Ugc+G7rSBk4bulbmcgZ8OzaSBGUkggdHLDqm4gxJHhu4MgbMOgbSBuw7NuZyBuxrDhu5tjIHThu6sgMjXCsEMgbMOqbiAxMDDCsEMgdGjDrCBsxrDhu6NuZyBuxrDhu5tjIHThu5FpIMSRYSB0aGVvIG1MIMSRxrDhu6NjIGzDoG0gbsOzbmcgbMOg"))
      $question.options = @(
        [ordered]@{ key = "A"; text = "175,6." },
        [ordered]@{ key = "B"; text = "203,9." },
        [ordered]@{ key = "C"; text = "169,9." },
        [ordered]@{ key = "D"; text = "187,5." }
      )
      $question.correct_answer = "B"
    } elseif ($question.question_number -eq 3) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Q2hvIHPhu6ljIMSRaeG7h24gxJHhu5luZyBjaHXhuqluIGPhu6dhIGPDoWMgcGluIMSRaeG7h24gaG/DoTogRcKwcGluKFQtWCkgPSAyLDQ2VjsgRcKwcGluKFQtWSkgPSAyLDAwVjsgRcKwcGluKFotWSkgPSAwLDk2ViAoduG7m2kgWCwgWSwgWiwgVCBsw6AgNCBraW0gbG/huqFpLCBraW0gbG/huqFpIOG7nyBiw6puIHRyw6FpIHRyb25nIGvDrSBoaeG7h3UgcGluIMSRw7NuZyB2YWkgdHLDsiBhbm9kZSkuIETDo3kgc+G6r3AgeOG6v3AgY8OhYyBraW0gbG/huqFpIHRoZW8gY2hp4buBdSB0xINuZyBk4bqnbiB0w61uaCBraOG7rSBsw6A="))
      $question.options = @(
        [ordered]@{ key = "A"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("WiA8IFggPCBZIDwgVC4=")) },
        [ordered]@{ key = "B"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("WCA8IFkgPCBaIDwgVC4=")) },
        [ordered]@{ key = "C"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("VCA8IFogPCBZIDwgWC4=")) },
        [ordered]@{ key = "D"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("WSA8IFQgPCBaIDwgWC4=")) }
      )
      $question.correct_answer = "B"
    } elseif ($question.question_number -eq 4) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("VGnhur9uIGjDoG5oIHRow60gbmdoaeG7h20gdGhlbyBjw6FjIGLGsOG7m2Mgc2F1OgpCxrDhu5tjIDE6IENobyA1IGdp4buNdCBkdW5nIGThu4tjaCBDdVNPNCAwLDUlIHbDoG8g4buRbmcgbmdoaeG7h20gc+G6oWNoLgpCxrDhu5tjIDI6IFRow6ptIDEgbUwgZHVuZyBk4buLY2ggTmFPSCAxMCUgdsOgbyDhu5FuZyBuZ2hp4buHbSwgbOG6r2MgxJHhu4F1OyBn4bqhbiBwaOG6p24gZHVuZyBk4buLY2gsIGdp4buvIGzhuqFpIGvhur90IHThu6dhLgpCxrDhu5tjIDM6IFRow6ptIHRp4bq/cCAyIG1MIGR1bmcgZOG7i2NoIGdsdWNvc2UgMSUgdsOgbyDhu5FuZyBuZ2hp4buHbSwgbOG6r2MgxJHhu4F1LgpQaMOhdCBiaeG7g3UgbsOgbyBzYXUgxJHDonkgbMOgIMSRw7puZz8="))
      $question.correct_answer = "B"
    } elseif ($question.question_number -eq 11) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Tmhp4buHdCDEkeG7mSBzw7RpIGPhu6dhIHLGsOG7o3UgKHRow6BuaCBwaOG6p24gY2jDrW5oIGzDoCBldGhhbm9sKSBsw6AgNzjCsEMgdsOgIGPhu6dhIG7GsOG7m2MgbMOgIDEwMMKwQy4gUGjGsMahbmcgcGjDoXAgcGjDuSBo4bujcCDEkeG7gyB0w6FjaCByxrDhu6N1IHJhIGto4buPaSBuxrDhu5tjIGzDoA=="))
      $question.options = @(
        [ordered]@{ key = "A"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("bOG7jWMu")) },
        [ordered]@{ key = "B"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("a+G6v3QgdGluaC4=")) },
        [ordered]@{ key = "C"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Y2jGsG5nIGPhuqV0Lg==")) },
        [ordered]@{ key = "D"; text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Y2hp4bq/dC4=")) }
      )
      $question.correct_answer = "C"
    } elseif ($question.question_number -eq 13) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("xJDhu4MgdHLDoW5nIG3hu5l0IHPhu5EgbMaw4bujbmcgZ8awxqFuZyBzb2kgY8OzIGRp4buHbiB0w61jaCBi4buBIG3hurd0IDAsNDUgbcKyIHbhu5tpIMSR4buZIGTDoHkgMCwyIM68bSBuZ8aw4budaSB0YSDEkXVuIG7Ds25nIGR1bmcgZOG7i2NoIGNo4bupYSA0NSBnYW0gZ2x1Y29zZSB24bubaSBt4buZdCBsxrDhu6NuZyBkdW5nIGThu4tjaCBBZ05PMyB0cm9uZyBOSDMuIEJp4bq/dCBraOG7kWkgbMaw4bujbmcgcmnDqm5nIGPhu6dhIGLhuqFjIGzDoCAxMCw0OSBnL2NtwrMsIGhp4buHdSBzdeG6pXQgcGjhuqNuIOG7qW5nIHRyw6FuZyBnxrDGoW5nIGzDoCA3MCUgKHTDrW5oIHRoZW8gZ2x1Y29zZSkuIFPhu5EgbMaw4bujbmcgZ8awxqFuZyBzb2kgdOG7kWkgxJFhIHPhuqNuIHh14bqldCDEkcaw4bujYyBsw6A="))
      $question.correct_answer = "B"
    } elseif ($question.question_number -eq 15) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Tmd1ecOqbiB04butIG5ndXnDqm4gdOG7kSBYIGPDsyBj4bqldSBow6xuaCBlbGVjdHJvbjogMXPCsiAyc8KyIDJw4oG2IDNzwrkuIFPhu5EgaGnhu4d1IG5ndXnDqm4gdOG7rSBj4bunYSBYIGzDoA=="))
      $question.correct_answer = "B"
    } elseif ($question.question_number -eq 22) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("TeG7mXQgcGluIEdhbHZhbmkgWm4g4oCTIEN1IGPDsyBj4bqldSB04bqhbyBuaMawIHNhdTogVHJvbmcgxJHDsywgbcOgbmcgYsOhbiB0aOG6pW0gY2jhu4kgY2hvIG7GsOG7m2MgdsOgIGPDoWMgYW5pb24gxJFpIHF1YS4gQmnhur90IHLhurFuZyB0aOG7gyB0w61jaCBj4bunYSBjw6FjIGR1bmcgZOG7i2NoIMSR4buBdSBsw6AgMCw1MCBMIHbDoCBu4buTbmcgxJHhu5kgY2jhuqV0IHRhbiB0cm9uZyBkdW5nIGThu4tjaCBsw6AgMSwwMCBNLiBDaG8gYmnhur90IEXCsChabjIrL1puKSA9IC0wLDc2M1Y7IEXCsChDdTIrL0N1KSA9ICswLDM0MFYu"))
    } elseif ($question.question_number -eq 24) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("TOG6r3AgcGluIMSRaeG7h24gaMOzYSBNZy1OaSDhu58gxJFp4buBdSBraeG7h24gY2h14bqpbi4gQ2hvIGJp4bq/dCBjw6FjIGdpw6EgdHLhu4sgdGjhur8gxJFp4buHbiBj4buxYyBjaHXhuqluOiBFwrAoTWcyKy9NZykgPSAtMiwzNTZWIHbDoCBFwrAoTmkyKy9OaSkgPSAtMCwyNTdWLiBT4bupYyDEkWnhu4duIMSR4buZbmcgY2h14bqpbiBj4bunYSBwaW4gxJFp4buHbiBow7NhIHRyw6puIGzDoCBiYW8gbmhpw6p1PyAoTMOgbSB0csOybiBr4bq/dCBxdeG6oyDEkeG6v24gaMOgbmcgcGjhuqduIG3GsOG7nWkp"))
    } elseif ($question.question_number -eq 25) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Q2hvIGJp4bq/dDogfCBD4bq3cCBveGkgaMOzYSAtIGto4butIHwgQ3UyKy9DdSB8IEFnKy9BZyB8IEZlMisvRmUgfCBNZzIrL01nIHwgMkgrL0gyIHwgfCBUaOG6vyDEkWnhu4duIGPhu7FjIGNodeG6qW4gRcKwLCBWIHwgKzAsMzQwIHwgKzAsNzk5IHwgLTAsNDQgfCAtMiwzNTYgfCAwLDAwMCB8IFRyb25nIGPDoWMga2ltIGxv4bqhaSBDdSwgQWcsIEZlIHbDoCBNZywgc+G7kSBraW0gbG/huqFpIGto4butIMSRxrDhu6NjIGlvbiBIKyB0cm9uZyBkdW5nIGThu4tjaCDhu58gxJFp4buBdSBraeG7h24gY2h14bqpbiBsw6AgYmFvIG5oacOqdT8="))
    } elseif ($question.question_number -eq 26) {
      $question.prompt = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("S+G6v3QgcXXhuqMgcGjDom4gdMOtY2ggbmd1ecOqbiB04buRIGPhu6dhIG3hu5l0IGFtaW5vIGFjaWQgWCBuaMawIHNhdTogJUMgPSA0MCw0NSU7ICVIID0gNyw4NyU7ICVOID0gMTUsNzQlICh24buBIGto4buRaSBsxrDhu6NuZyk7IGPDsm4gbOG6oWkgbMOgIG94eWdlbi4gQuG6sW5nIHBo4buVIGto4buRaSBsxrDhu6NuZyAoTVMpLCB4w6FjIMSR4buLbmggxJHGsOG7o2MgcGjDom4gdOG7rSBraOG7kWkgY+G7p2EgWCBi4bqxbmcgODkuIENobyBjw6FjIHBow6F0IGJp4buDdSBzYXU6CigxKSBDw7RuZyB0aOG7qWMgcGjDom4gdOG7rSBj4bunYSBYIGzDoCBDNEg5TzJOLgooMikgS2hpIMSR4bq3dCBYIMSRxrDhu6NjIMSRaeG7gXUgY2jhu4luaCDEkeG6v24gcEggPSA2LDAgdHJvbmcgxJFp4buHbiB0csaw4budbmcgdGjDrCBYIHPhur0gZGkgY2h1eeG7g24gduG7gSBj4buxYyBkxrDGoW5nLgooMykgQ8OzIDIgYW1pbm8gYWNpZCDEkeG7k25nIHBow6JuIGPhuqV1IHThuqFvIOG7qW5nIHbhu5tpIGPDtG5nIHRo4bupYyBwaMOibiB04butIGPhu6dhIFguCig0KSBUcm9uZyBwaMOibiB04butIFggY8OzIDEgbmjDs20gLU5IMiB2w6AgMSBuaMOzbSAtQ09PSC4KTGnhu4d0IGvDqiBjw6FjIHBow6F0IGJp4buDdSDEkcO6bmcgdGhlbyBz4buRIHRo4bupIHThu7EgdMSDbmcgZOG6p24u"))
    }
  }

  return $questions
}

function Get-ImageSize([string]$path) {
  $bitmap = [Drawing.Bitmap]::FromFile($path)
  try {
    return [ordered]@{ width = $bitmap.Width; height = $bitmap.Height }
  } finally {
    $bitmap.Dispose()
  }
}

function Add-QuestionImages($paragraph, $zip, $relMap, $nsm, [string]$mediaDir, [string]$slug, [int]$questionNumber, $questionImages) {
  foreach ($blip in $paragraph.SelectNodes(".//a:blip", $nsm)) {
    $rid = $blip.GetAttribute("embed", $r)
    if (-not $rid -or -not $relMap.ContainsKey($rid)) { continue }

    $target = $relMap[$rid] -replace "^/", ""
    $entryPath = if ($target.StartsWith("media/")) { "word/$target" } else { "word/$target" }
    $entry = $zip.GetEntry($entryPath)
    if (-not $entry) { continue }

    $ext = [IO.Path]::GetExtension($entry.Name)
    $outName = "q$questionNumber-$rid$ext"
    $outPath = Join-Path $mediaDir $outName
    $stream = $entry.Open()
    try {
      $fs = [IO.File]::Create($outPath)
      try { $stream.CopyTo($fs) } finally { $fs.Dispose() }
    } finally {
      $stream.Dispose()
    }

    $size = Get-ImageSize $outPath
    if (-not $questionImages.ContainsKey($questionNumber)) {
      $questionImages[$questionNumber] = New-Object System.Collections.Generic.List[object]
    }
    $questionImages[$questionNumber].Add([ordered]@{
      pageNumber = 1
      url = "/exam-assets/week-5/$slug/media/${outName}?v=week-5-20260604"
      width = $size.width
      height = $size.height
    })
  }
}

New-Item -ItemType Directory -Force -Path $publicRoot | Out-Null
$files = @(Get-ChildItem -LiteralPath $SourceDir -Filter *.docx | Sort-Object Name)
if ($files.Count -ne 2) {
  throw "Expected 2 .docx files in '$SourceDir', found $($files.Count)."
}

$exams = @()
$assets = [ordered]@{}
$index = 1

foreach ($file in $files) {
  $base = [IO.Path]::GetFileNameWithoutExtension($file.Name)
  $slug = Get-Slug $base
  $mediaDir = Join-Path (Join-Path $publicRoot $slug) "media"
  New-Item -ItemType Directory -Force -Path $mediaDir | Out-Null
  $wordParagraphTexts = @(Get-WordParagraphTexts $file.FullName)

  $zip = [IO.Compression.ZipFile]::OpenRead($file.FullName)
  try {
    $reader = New-Object IO.StreamReader($zip.GetEntry("word/document.xml").Open(), [Text.Encoding]::UTF8)
    [xml]$xml = $reader.ReadToEnd()
    $reader.Close()

    $reader = New-Object IO.StreamReader($zip.GetEntry("word/_rels/document.xml.rels").Open(), [Text.Encoding]::UTF8)
    [xml]$relsXml = $reader.ReadToEnd()
    $reader.Close()

    $relMap = @{}
    foreach ($rel in $relsXml.Relationships.Relationship) {
      $relMap[$rel.Id] = $rel.Target
    }

    $nsm = New-Object Xml.XmlNamespaceManager($xml.NameTable)
    $nsm.AddNamespace("w", $w)
    $nsm.AddNamespace("a", $a)
    $nsm.AddNamespace("r", $r)

    $currentSection = $sectionIText
    $currentLocal = $null
    $currentQuestionSection = $sectionIText
    $currentLines = New-Object System.Collections.Generic.List[string]
    $questions = @()
    $sortOrder = 1
    $questionImages = @{}

    $paragraphs = @($xml.SelectNodes("//w:p", $nsm))
    for ($paragraphIndex = 0; $paragraphIndex -lt $paragraphs.Count; $paragraphIndex++) {
      $p = $paragraphs[$paragraphIndex]
      $text = if ($paragraphIndex -lt $wordParagraphTexts.Count) {
        $wordParagraphTexts[$paragraphIndex]
      } else {
        (($p.SelectNodes(".//w:t", $nsm) | ForEach-Object { $_."#text" }) -join " ")
      }
      $clean = Normalize-Text $text

      if (-not $clean) {
        if ($null -ne $currentLocal) {
          $globalNumber = Get-GlobalNumber $currentQuestionSection $currentLocal
          Add-QuestionImages $p $zip $relMap $nsm $mediaDir $slug $globalNumber $questionImages
        }
        continue
      }

      if ($clean -match "H.{0,3}NG\s*D.{0,3}N\s*GI.{0,3}I") { break }

      $questionCandidates = @()
      foreach ($candidate in [regex]::Matches($clean, "$cauPattern\s*(\d+)\s*[\.:]")) {
        $prefixStart = [Math]::Max(0, $candidate.Index - 16)
        $prefix = $clean.Substring($prefixStart, $candidate.Index - $prefixStart).ToLowerInvariant()
        if ($prefix -notmatch "tu|den|tá»«|Ä‘áº¿n") {
          $questionCandidates += $candidate
        }
      }

      $sectionIIMatch = [regex]::Match($clean, "PH.{0,3}N\s*II")
      $sectionIIIMatch = [regex]::Match($clean, "PH.{0,3}N\s*III")

      if ($questionCandidates.Count -eq 0) {
        if ($sectionIIMatch.Success) { $currentSection = $sectionIIText }
        if ($sectionIIIMatch.Success) { $currentSection = $sectionIIIText }
        if (Is-SectionHeading $clean) { continue }
        if ($null -ne $currentLocal) { $currentLines.Add($clean) }
      } else {
        for ($candidateIndex = 0; $candidateIndex -lt $questionCandidates.Count; $candidateIndex++) {
          $questionMatch = $questionCandidates[$candidateIndex]
          if ($sectionIIMatch.Success -and $sectionIIMatch.Index -lt $questionMatch.Index) { $currentSection = $sectionIIText }
          if ($sectionIIIMatch.Success -and $sectionIIIMatch.Index -lt $questionMatch.Index) { $currentSection = $sectionIIIText }

          if ($candidateIndex -eq 0 -and $null -ne $currentLocal -and $questionMatch.Index -gt 0) {
            $leading = $clean.Substring(0, $questionMatch.Index).Trim()
            if ($leading -and -not (Is-SectionHeading $leading)) { $currentLines.Add($leading) }
          }

          if ($null -ne $currentLocal -and $currentLines.Count -gt 0) {
            $questions += New-Question $currentQuestionSection $currentLocal ($currentLines.ToArray()) $sortOrder
            $sortOrder++
            $currentLines.Clear()
          }

          $currentLocal = [int]$questionMatch.Groups[1].Value
          $currentQuestionSection = $currentSection
          $segmentStart = $questionMatch.Index + $questionMatch.Length
          $segmentEnd = if ($candidateIndex + 1 -lt $questionCandidates.Count) { $questionCandidates[$candidateIndex + 1].Index } else { $clean.Length }
          $afterMarker = $clean.Substring($segmentStart, $segmentEnd - $segmentStart)
          if ($afterMarker.Trim()) { $currentLines.Add($afterMarker.Trim()) }
        }

        $lastQuestionMatch = $questionCandidates[$questionCandidates.Count - 1]
        if ($sectionIIMatch.Success -and $sectionIIMatch.Index -gt $lastQuestionMatch.Index) { $currentSection = $sectionIIText }
        if ($sectionIIIMatch.Success -and $sectionIIIMatch.Index -gt $lastQuestionMatch.Index) { $currentSection = $sectionIIIText }
      }

      if ($null -ne $currentLocal) {
        $globalNumber = Get-GlobalNumber $currentQuestionSection $currentLocal
        Add-QuestionImages $p $zip $relMap $nsm $mediaDir $slug $globalNumber $questionImages
      }
    }

    if ($null -ne $currentLocal -and $currentLines.Count -gt 0) {
      $questions += New-Question $currentQuestionSection $currentLocal ($currentLines.ToArray()) $sortOrder
    }

    $questions = @(
      $questions |
        Group-Object { $_.question_number } |
        Sort-Object { [int]$_.Name } |
        ForEach-Object { $_.Group | Sort-Object { $_.prompt.Length } -Descending | Select-Object -First 1 }
    )
    for ($questionIndex = 0; $questionIndex -lt $questions.Count; $questionIndex++) {
      $questions[$questionIndex].sort_order = $questionIndex + 1
      if ($questions[$questionIndex].question_number -le 18) {
        $questions[$questionIndex].section = $sectionIText
      } elseif ($questions[$questionIndex].question_number -le 22) {
        $questions[$questionIndex].section = $sectionIIText
      } else {
        $questions[$questionIndex].section = $sectionIIIText
      }
    }
    $questions = @(Repair-Week3QuestionText $file.Name $questions)

    $assetQuestions = [ordered]@{}
    foreach ($questionNumber in ($questionImages.Keys | Sort-Object { [int]$_ })) {
      $assetQuestions.Add("$questionNumber", [object[]]$questionImages[$questionNumber].ToArray())
    }

    $assets[$slug] = [ordered]@{
      slug = $slug
      sourceFileName = $file.Name
      questionAssets = $assetQuestions
    }

    $titlePrefix = "{0:00}.06.{1:00}" -f 4, $index
    $exams += [ordered]@{
      title = $titlePrefix
      description = $examDescriptionText
      subject = $chemistrySubjectText
      duration_minutes = 50
      slugSuffix = "$slug-week-5"
      source_file_name = $file.Name
      is_active = $true
      questions = $questions
    }
  } finally {
    $zip.Dispose()
  }

  $index++
}

$jsonOptions = @{ Depth = 100; Compress = $false }
[IO.File]::WriteAllText($dataPath, ($exams | ConvertTo-Json @jsonOptions), [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($assetPath, ($assets | ConvertTo-Json @jsonOptions), [Text.UTF8Encoding]::new($false))

node (Join-Path $PSScriptRoot "postprocess-week-5-exams.mjs")

Write-Host "Generated $($exams.Count) week 5 exams from $SourceDir -> $dataPath"
Write-Host "Generated original embedded image assets -> $assetPath"

