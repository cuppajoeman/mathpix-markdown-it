export const endTag = (arg: string): RegExp  => {
  return new RegExp('\\\\end\s{0,}\{(' + arg + ')\}')
};

export const getTextWidth = (): number => {
  const el_container = document ? document.getElementById('container-ruller') : null;
  return el_container ? el_container.offsetWidth : 800;
};

export const isNotBackticked = (str: string, tag: string): boolean => {
  let
    pos = 0,
    max = str.length,
    ch,
    escapes = 0,
    backTicked = false,
    lastBackTick = 0;

  ch  = str.charCodeAt(pos);
  let st = '';
  let st2 = '';
  let isIgnore = false;
  while (pos < max) {
    if (ch === 0x60/* ` */) {
      if (backTicked) {
        backTicked = false;
        lastBackTick = pos;
        if (st.includes(tag)) {
          isIgnore = true;
          st = ''
        }
      } else if (escapes % 2 === 0) {
        backTicked = true;
        lastBackTick = pos;
      }
    } else {
      if (backTicked) {
       // isIgnore = false;
        st += str[pos]
      } else {
        st2 += str[pos]
      }
    }

    if (ch === 0x5c/* \ */
      && (pos + 1 < max && str.charCodeAt(pos + 1) === 0x60)) {
      escapes++;
    } else {
      escapes = 0;
    }

    pos++;

    // If there was an un-closed backtick, go back to just after
    // the last backtick, but as if it was a normal character
    if (pos === max && backTicked) {
      backTicked = false;
      pos = lastBackTick + 1;
    }

    ch = str.charCodeAt(pos);
  }
  return !isIgnore || st2.includes(tag);
};

export const includesSimpleMathTag = (str: string, tag = '$$') => {
  return str.includes(tag) && isNotBackticked(str, tag);
};

export const includesMultiMathBeginTag = (str, tag): RegExp | null => {
  let result: RegExp | null = null;
  if (!tag.test(str)) {
    return result;
  }
  let match;
  for (let i = 0; i < str.length; i++) {
    result = null;
    const str1 = i < str.length ? str.slice(i) : '';
    match = str1 ? str1.match(tag) : null;
    if (!match) {
      break;
    }
    if (isNotBackticked(str, match[0])) {
      result = null;
      if (match[0] === "\\[" || match[0] === "\[") {
        result = /\\\]/;
      } else if (match[0] === "\\(" || match[0] === "\(") {
        result = /\\\)/;
      } else if (match[1]) {
        result = new RegExp(`\end{${match[1]}}`);
      }
      break;
    } else {
      i += match.index + match[0].length - 1;
    }
  }
  return result;
};

export const includesMultiMathTag = (str, tag): boolean => {
  let result = false;
  if (!tag.test(str)) {
    return result;
  }
  let match;
  for (let i = 0; i < str.length; i++) {
    result = false;
    const str1 = i < str.length ? str.slice(i) : '';
    match = str1 ? str1.match(tag) : null;
    if (!match) {
      break;
    }
    if (isNotBackticked(str, match[0])) {
      result = true;
      break;
    } else {
      i += match.index + match[0].length
    }
  }
  return result;
};
