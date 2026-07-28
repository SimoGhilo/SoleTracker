export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  return emailRegex.test(email);
}


export function validatePassword(password: string): boolean {
  const regexSym: RegExp = /[@!$%&*()]/;

  let hasCap = false;
  let hasSymbol = false;

  for (const char of password) {
    if (char === char.toUpperCase()) {
      hasCap = true;
    }

    if (regexSym.test(char)) {
      hasSymbol = true;
    }
  }

  return password.length >= 10 && hasCap && hasSymbol;
}


export function validateBusinessName(name: string): boolean {
  return name.length >= 3;
}