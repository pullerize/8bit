export function formatPhone(phoneInput) {
  let digits = phoneInput.value.replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  else if (digits.startsWith('8')) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  let out = '+998 ';
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += ' ' + digits.slice(2, 5);
  if (digits.length > 5) out += ' ' + digits.slice(5, 7);
  if (digits.length > 7) out += ' ' + digits.slice(7, 9);
  phoneInput.value = out;
}
