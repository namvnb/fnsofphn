param(
  [string]$SourceDir
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing

$repo = Split-Path -Parent $PSScriptRoot
if (-not $SourceDir) {
  $externalSourceDir = "E:\nam\cy\de tuan 2"
  $SourceDir = if (Test-Path -LiteralPath $externalSourceDir) {
    $externalSourceDir
  } else {
    Join-Path $repo "project content\De thi giup Cy\de tuan 2-20260519T012310Z-3-001\de tuan 2"
  }
}

$publicRoot = Join-Path $repo "public\exam-assets\week-2"
$dataPath = Join-Path $repo "features\giup-cy\week-2-exams.json"
$assetPath = Join-Path $repo "features\giup-cy\week-2-assets.json"

$w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
$a = "http://schemas.openxmlformats.org/drawingml/2006/main"
$r = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

$cauPattern = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("Q8OidQ=="))
$sectionIText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("UGjhuqduIEk="))
$sectionIIText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("UGjhuqduIElJ"))
$sectionIIIText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("UGjhuqduIElJSQ=="))
$questionReviewText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("xJDhu4EgxJHGsOG7o2Mgbmjhuq1wIHThu6sgV29yZCB0deG6p24gMjsgxJHDoXAgw6FuIGPhuqduIHLDoCBzb8OhdCB0aOG7pyBjw7RuZyDEkeG7gyB0csOhbmggbOG7l2kgY8O0bmcgdGjhu6ljL2jDrG5oLg=="))
$examDescriptionText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("xJDhu4EgdHXhuqduIDIgxJHGsOG7o2Mgbmjhuq1wIHThu6sgZmlsZSBXb3JkIGfhu5FjLiBDw6FjIGPDonUgY8OzIGPDtG5nIHRo4bupYy9ow6xuaCDEkcaw4bujYyBnaeG7ryBuaMO6bmcgdOG7qyBXb3JkOyDEkcOhcCDDoW4gxJFhbmcgxJHhu4MgcsOgIHNvw6F0IMSR4buDIHRyw6FuaCBjaOG6pW0gc2FpLg=="))
$chemistrySubjectText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("SMOzYSBo4buNYw=="))

function Normalize-Text([string]$value) {
  if ($null -eq $value) { return "" }
  return ($value -replace "\s+", " ").Trim()
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
  $ascii = $chars.ToString() -replace "đ", "d"
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

  $points = if ($kind -eq "single_choice") { 0.25 } elseif ($kind -eq "true_false") { 1 } else { 0.5 }
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
      url = "/exam-assets/week-2/$slug/media/${outName}?v=week-2-20260522"
      width = $size.width
      height = $size.height
    })
  }
}

New-Item -ItemType Directory -Force -Path $publicRoot | Out-Null
$files = @(Get-ChildItem -LiteralPath $SourceDir -Filter *.docx | Sort-Object Name)
if ($files.Count -ne 4) {
  throw "Expected 4 .docx files in '$SourceDir', found $($files.Count)."
}

$exams = @()
$assets = [ordered]@{}
$index = 1

foreach ($file in $files) {
  $base = [IO.Path]::GetFileNameWithoutExtension($file.Name)
  $slug = Get-Slug $base
  $mediaDir = Join-Path (Join-Path $publicRoot $slug) "media"
  New-Item -ItemType Directory -Force -Path $mediaDir | Out-Null

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

    foreach ($p in $xml.SelectNodes("//w:p", $nsm)) {
      $text = (($p.SelectNodes(".//w:t", $nsm) | ForEach-Object { $_."#text" }) -join " ")
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
        if ($prefix -notmatch "tu|den|từ|đến") {
          $questionCandidates += $candidate
        }
      }

      $sectionIIMatch = [regex]::Match($clean, "PH.{0,3}N\s*II")
      $sectionIIIMatch = [regex]::Match($clean, "PH.{0,3}N\s*III")

      if ($questionCandidates.Count -eq 0) {
        if ($sectionIIMatch.Success) { $currentSection = $sectionIIText }
        if ($sectionIIIMatch.Success) { $currentSection = $sectionIIIText }
        if ($null -ne $currentLocal) { $currentLines.Add($clean) }
      } else {
        for ($candidateIndex = 0; $candidateIndex -lt $questionCandidates.Count; $candidateIndex++) {
          $questionMatch = $questionCandidates[$candidateIndex]
          if ($sectionIIMatch.Success -and $sectionIIMatch.Index -lt $questionMatch.Index) { $currentSection = $sectionIIText }
          if ($sectionIIIMatch.Success -and $sectionIIIMatch.Index -lt $questionMatch.Index) { $currentSection = $sectionIIIText }

          if ($candidateIndex -eq 0 -and $null -ne $currentLocal -and $questionMatch.Index -gt 0) {
            $leading = $clean.Substring(0, $questionMatch.Index).Trim()
            if ($leading) { $currentLines.Add($leading) }
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

    $assetQuestions = [ordered]@{}
    foreach ($questionNumber in ($questionImages.Keys | Sort-Object { [int]$_ })) {
      $assetQuestions.Add("$questionNumber", [object[]]$questionImages[$questionNumber].ToArray())
    }

    $assets[$slug] = [ordered]@{
      slug = $slug
      sourceFileName = $file.Name
      questionAssets = $assetQuestions
    }

    $titlePrefix = "{0:00}.05.{1:00}" -f 19, $index
    $exams += [ordered]@{
      title = $titlePrefix
      description = $examDescriptionText
      subject = $chemistrySubjectText
      duration_minutes = 50
      slugSuffix = "$slug-week-2"
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

Write-Host "Generated $($exams.Count) exams from $SourceDir -> $dataPath"
Write-Host "Generated original embedded image assets -> $assetPath"
