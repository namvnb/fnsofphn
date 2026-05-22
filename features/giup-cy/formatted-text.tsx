import type { ReactNode } from "react";

const elementSymbols = new Set([
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Sc",
  "Ti",
  "V",
  "Cr",
  "Mn",
  "Fe",
  "Co",
  "Ni",
  "Cu",
  "Zn",
  "Ga",
  "Ge",
  "As",
  "Se",
  "Br",
  "Kr",
  "Rb",
  "Sr",
  "Y",
  "Zr",
  "Nb",
  "Mo",
  "Tc",
  "Ru",
  "Rh",
  "Pd",
  "Ag",
  "Cd",
  "In",
  "Sn",
  "Sb",
  "Te",
  "I",
  "Xe",
  "Cs",
  "Ba",
  "La",
  "Ce",
  "Pr",
  "Nd",
  "Pm",
  "Sm",
  "Eu",
  "Gd",
  "Tb",
  "Dy",
  "Ho",
  "Er",
  "Tm",
  "Yb",
  "Lu",
  "Hf",
  "Ta",
  "W",
  "Re",
  "Os",
  "Ir",
  "Pt",
  "Au",
  "Hg",
  "Tl",
  "Pb",
  "Bi",
  "Po",
  "At",
  "Rn",
  "Fr",
  "Ra",
  "Ac",
  "Th",
  "Pa",
  "U",
  "Np",
  "Pu",
  "Am",
  "Cm",
  "Bk",
  "Cf",
  "Es",
  "Fm",
  "Md",
  "No",
  "Lr",
  "Rf",
  "Db",
  "Sg",
  "Bh",
  "Hs",
  "Mt",
  "Ds",
  "Rg",
  "Cn",
  "Nh",
  "Fl",
  "Mc",
  "Lv",
  "Ts",
  "Og"
]);

const variableSubscripts = new Set(["m", "n", "x", "y"]);
const formattedTokenPattern = /Δ[fr]H°\d+|mol\^-?\d+|mol-\d+|\b\d*[A-Z][A-Za-z0-9()[\]\-+=.]*/g;

function stripFormulaCharge(value: string) {
  const parenthesizedCharge = value.match(/^(.*)\((\d*[+-])\)$/);
  if (parenthesizedCharge) {
    return { body: parenthesizedCharge[1], charge: parenthesizedCharge[2], hasCharge: true };
  }

  const compactPolyatomicCharge = value.match(/^(.*[A-Z][A-Za-z]*)(\d)([+-])$/);
  if (compactPolyatomicCharge && countElementSymbols(compactPolyatomicCharge[1]) > 1) {
    return { body: `${compactPolyatomicCharge[1]}${compactPolyatomicCharge[2]}`, charge: compactPolyatomicCharge[3], hasCharge: true };
  }

  const inlineCharge = value.match(/^(.*?)(\d*[+-])$/);
  if (inlineCharge && inlineCharge[1]) {
    return { body: inlineCharge[1].trimEnd(), charge: inlineCharge[2], hasCharge: true };
  }

  return { body: value, charge: "", hasCharge: false };
}

function countElementSymbols(value: string) {
  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];
    if (!/[A-Z]/.test(char)) continue;

    const symbol = next && /[a-z]/.test(next) ? `${char}${next}` : char;
    if (elementSymbols.has(symbol)) {
      count += 1;
      index += symbol.length - 1;
    } else if (elementSymbols.has(char)) {
      count += 1;
    }
  }

  return count;
}

function splitStateSuffix(value: string) {
  const stateSuffix = value.match(/^(.*?)(\((?:s|l|g|aq)\))([.,;:]?)$/);
  if (!stateSuffix) return { core: value, suffix: "" };

  return { core: stateSuffix[1], suffix: `${stateSuffix[2]}${stateSuffix[3]}` };
}

function analyzeFormulaToken(value: string) {
  const tokenWithoutCoefficient = value.replace(/^\d+(?=[A-Z([])/, "");
  const { core } = splitStateSuffix(tokenWithoutCoefficient);
  const { body, hasCharge } = stripFormulaCharge(core);
  let elementCount = 0;
  let hasFormulaSignal = hasCharge || /[\d()[\]=]/.test(body);

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];

    if (/[A-Z]/.test(char)) {
      const next = body[index + 1];
      const symbol = next && /[a-z]/.test(next) ? `${char}${next}` : char;

      if (symbol === "Cn" && body[index + 2] === "(") {
        elementCount += 1;
        hasFormulaSignal = true;
        index += 1;
        continue;
      }

      if (elementSymbols.has(symbol)) {
        elementCount += 1;
        index += symbol.length - 1;
        continue;
      }

      if (elementSymbols.has(char) && next && variableSubscripts.has(next)) {
        elementCount += 1;
        hasFormulaSignal = true;
        index += 1;
        continue;
      }

      if (elementSymbols.has(char)) {
        elementCount += 1;
        continue;
      }

      if (char === "R") {
        elementCount += 1;
        continue;
      }

      return { isFormula: false, elementCount: 0 };
    }

    if (/[a-z]/.test(char)) {
      if (variableSubscripts.has(char)) {
        hasFormulaSignal = true;
        continue;
      }

      return { isFormula: false, elementCount: 0 };
    }

    if (!/[\d()[\]\-+=.]/.test(char)) {
      return { isFormula: false, elementCount: 0 };
    }
  }

  return { isFormula: elementCount > 0 && (hasFormulaSignal || elementCount > 1), elementCount };
}

function renderFormulaBody(value: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];
    const twoCharSymbol = next && /[a-z]/.test(next) ? `${char}${next}` : "";

    if (/\d/.test(char)) {
      let digits = char;
      while (/\d/.test(value[index + 1] ?? "")) {
        digits += value[index + 1];
        index += 1;
      }
      nodes.push(<sub key={`${keyPrefix}-sub-${index}`}>{digits}</sub>);
      continue;
    }

    if (/[A-Z]/.test(char) && twoCharSymbol && elementSymbols.has(twoCharSymbol) && !(twoCharSymbol === "Cn" && value[index + 2] === "(")) {
      nodes.push(twoCharSymbol);
      index += 1;
      continue;
    }

    if (/[A-Z]/.test(char) && next && variableSubscripts.has(next)) {
      nodes.push(char);
      nodes.push(<sub key={`${keyPrefix}-var-${index}`}>{next}</sub>);
      index += 1;
      continue;
    }

    if (variableSubscripts.has(char) && (value[index - 1] === ")" || value[index - 1] === "]")) {
      nodes.push(<sub key={`${keyPrefix}-var-${index}`}>{char}</sub>);
      continue;
    }

    nodes.push(char);
  }

  return nodes;
}

function renderFormulaToken(value: string, keyPrefix: string) {
  const coefficient = value.match(/^\d+(?=[A-Z([])/)?.[0] ?? "";
  const withoutCoefficient = coefficient ? value.slice(coefficient.length) : value;
  const { core, suffix } = splitStateSuffix(withoutCoefficient);
  const { body, charge } = stripFormulaCharge(core);

  return (
    <span key={keyPrefix} className="whitespace-nowrap">
      {coefficient}
      {renderFormulaBody(body, `${keyPrefix}-body`)}
      {charge ? <sup>{charge}</sup> : null}
      {suffix}
    </span>
  );
}

function renderThermodynamicSymbol(value: string, keyPrefix: string) {
  const match = value.match(/^Δ([fr])H°(\d+)$/);
  if (!match) return value;

  return (
    <span key={keyPrefix} className="whitespace-nowrap">
      Δ<sub>{match[1]}</sub>H°<sub>{match[2]}</sub>
    </span>
  );
}

function renderMoleUnit(value: string, keyPrefix: string) {
  const exponent = value.match(/^mol(?:\^)?(-?\d+)$/)?.[1] ?? value.match(/^mol(-\d+)$/)?.[1];
  if (!exponent) return value;

  return (
    <span key={keyPrefix} className="whitespace-nowrap">
      mol<sup>{exponent}</sup>
    </span>
  );
}

export function FormattedText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const matcher = new RegExp(formattedTokenPattern);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(text))) {
    const [rawToken] = match;
    const offset = match.index;
    const spacedCharge = text.slice(offset + rawToken.length).match(/^(\s+)(\d+[+-])/);
    const token = spacedCharge ? `${rawToken}${spacedCharge[1]}${spacedCharge[2]}` : rawToken;

    if (/^Δ[fr]H°\d+$/.test(token)) {
      if (offset > lastIndex) nodes.push(text.slice(lastIndex, offset));
      nodes.push(renderThermodynamicSymbol(token, `thermo-${offset}`));
      lastIndex = offset + token.length;
      matcher.lastIndex = lastIndex;
    } else if (/^mol(?:\^)?-?\d+$/.test(token) || /^mol-\d+$/.test(token)) {
      if (offset > lastIndex) nodes.push(text.slice(lastIndex, offset));
      nodes.push(renderMoleUnit(token, `unit-${offset}`));
      lastIndex = offset + token.length;
      matcher.lastIndex = lastIndex;
    } else if (analyzeFormulaToken(token).isFormula) {
      if (offset > lastIndex) nodes.push(text.slice(lastIndex, offset));
      nodes.push(renderFormulaToken(token, `formula-${offset}`));
      lastIndex = offset + token.length;
      matcher.lastIndex = lastIndex;
    }
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}
