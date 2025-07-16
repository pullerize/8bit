export function loadSaved(nameInput, phoneInput, saveBox) {
  if (localStorage.getItem('saveData') === '1') {
    nameInput.value = localStorage.getItem('savedName') || '';
    phoneInput.value = localStorage.getItem('savedPhone') || '+998 ';
    saveBox.checked = true;
  } else {
    nameInput.value = '';
    phoneInput.value = '+998 ';
    saveBox.checked = false;
  }
}

export function saveIfNeeded(nameInput, phoneInput, saveBox) {
  if (saveBox.checked) {
    localStorage.setItem('saveData', '1');
    localStorage.setItem('savedName', nameInput.value);
    localStorage.setItem('savedPhone', phoneInput.value);
  } else {
    localStorage.removeItem('saveData');
    localStorage.removeItem('savedName');
    localStorage.removeItem('savedPhone');
  }
}
