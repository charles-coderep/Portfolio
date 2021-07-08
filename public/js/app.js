let toggleAppIconBar = false;
let reminderItems = []; // add all reminder objects into array

/* Namespace instead of using globals */
let formElements = {
  appButton: document.querySelector('#projects .reminder-app'),
  closeButton: document.querySelector('.app-close-window'),
  dateElement: document.getElementById('date'),
  textElement: document.getElementById('text'),
  titleElement: document.getElementById('title'),
  button: document.getElementById('button'),

  clearFields_Validation: function () {
    this.dateElement.value = '';
    this.textElement.value = '';
    this.titleElement.value = '';

    this.dateElement.classList.remove('validation');
    this.titleElement.classList.remove('validation');
    this.textElement.classList.remove('validation');
  },
  setMinInputDate: function () {
    let iso = new Date().toISOString();
    let todayDate = iso.substring(0, 16);
    return todayDate;
  }
}

/* When a user checks off/on a reminder, switch boolean value and save to DB */
let toggleDone = (key) => {
  let index = reminderItems.findIndex(element => element.id === key);
  reminderItems[index].checked = !reminderItems[index].checked;
  addToDB(reminderItems[index], 'PUT');
  if (reminderItems[index].checked) {
    reminderItems.unshift(reminderItems.splice(index, 1)[0]);
  } else {
    reminderItems.push(reminderItems.splice(index, 1)[0]);
  }
}

/*Send obj to DB for deletion*/
let removeReminder = (key) => {
  let index = reminderItems.findIndex(element => element.id === key);
  reminderItems[index].deleted = !reminderItems[index].deleted;
  addToDB(reminderItems[index], 'DELETE');
}

/**
 * Editable areas of the saved reminder on the list, depending what the 
 * user interacts with
 */
let editArea = document.querySelector(".reminder-app > ul");
editArea.addEventListener('click', event => {
  let editAreaClassname = event.target.className;
  let itemKey = event.target.getAttribute("id");
  switch (editAreaClassname) {
    case 'checkbox_circle':
      toggleDone(itemKey);
      break;
    case 'title':
    case 'text':
    case 'date':
    case 'date older':
      event.target.addEventListener('blur', saveField);
      break;
    case 'deletebox':
      removeReminder(itemKey);
      break;
  }
});

/**Checks for the change on the title, textarea and date
 * input fields and saves to DB if true
 */
function saveField(e) {
  let textValue = this.value;
  let key = this.getAttribute('data-key');
  let index = reminderItems.findIndex(element => element.id === key);
  if (this.className === 'title') {

    if (reminderItems[index].title !== textValue) {
      reminderItems[index].title = textValue;
      addToDB(reminderItems[index], 'PUT', 'textedit');
    } else {
      console.log('input title NO change');
    }
  } else if (this.className === 'text') {

    if (reminderItems[index].text !== textValue) {
      reminderItems[index].text = textValue;
      addToDB(reminderItems[index], 'PUT', 'textedit');
    } else {
      console.log('textarea text NO change');
    }
  } else if (this.className === 'date' || this.className === 'date older') {
    if (reminderItems[index].date !== textValue) {
      reminderItems[index].date = textValue;
      addToDB(reminderItems[index], 'PUT', 'textedit');
    } else {
      console.log('input date NO change');
    }
  }
}

/**Render reminder to the list. Receives obj as argument and  
 * in cases where a text is made, arg is set to 'textedit'. The function appends/ prepends
 * according to a list of conditions (new-edited-checked-unchecked)
 */

let renderReminder = (reminderObj, arg) => {
  let uList = document.querySelector('.reminder-app > ul');
  let itemExists = document.querySelector(`[data-key='${reminderObj.id}']`);

  let isChecked = reminderObj.checked ? 'checked' : '';
  let isReadonly = reminderObj.checked ? 'readonly' : '';
  let isNoedit = reminderObj.checked ? ' noedit' : '';

  if (reminderObj.deleted) {
    let deleteNode = document.querySelector(`[data-key='${reminderObj.id}']`);
    deleteNode.remove();
    return;
  }

  let isOld = (reminderObj.date < formElements.setMinInputDate()) ? ' older' : '';

  let liNode = document.createElement('li');
  liNode.setAttribute('data-key', reminderObj.id);
  liNode.setAttribute('class', isChecked);
  liNode.innerHTML = `<div class="check_del"><input class="checkbox_circle"id="${reminderObj.id}" type="checkbox" ${isChecked}/><label title="Mark complete" for="${reminderObj.id}"></label><div title="Delete reminder" class="deletebox" id="${reminderObj.id}"></div></div>
<div class="rem_details flex"><input title="Edit title" class="title${isNoedit}" data-key="${reminderObj.id}" type="text" value="${reminderObj.title}" ${isReadonly}/>
<textarea title="Edit details" class="text${isNoedit}" data-key="${reminderObj.id}" rows="2" ${isReadonly}>${reminderObj.text}</textarea>
<input title="Edit date - type or click icon" class="date${isOld}" data-key="${reminderObj.id}" type="datetime-local" name="date" id="date" value="${reminderObj.date}" /></div>
`;
  if (arg === 'textedit') {
    uList.replaceChild(liNode, itemExists);
  }
  else if (itemExists && isChecked) {
    uList.replaceChild(liNode, itemExists);
    setTimeout(() => {
      uList.append(liNode)
    }, 300);
  } else if (itemExists && !isChecked) {
    uList.replaceChild(liNode, itemExists);
    uList.prepend(liNode);
  } else if (!itemExists && isChecked) {
    uList.append(liNode);
  } else if (!itemExists && !isChecked) {
    uList.prepend(liNode);
  }
}
/***
 * Sending data to the server via and if successful add to list
 * 
 */
let addToDB = (reminderObj, method, arg) => {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reminderObj)
  }

  fetch('/reminderAppData', options)
    .then(renderReminder(reminderObj, arg));
}

/** Own ID creation. Ideally the object would be created, sent to the database and
 * the returned object with _id saved in reminderitems[]. Instead own id is created 
 * so that editing on newly created items can be done. 
 * Convert it to base 36 (numbers + letters), and grab the first 7 characters
 * after the decimal.  
 ***/
let ID = () => {
  return Math.random().toString(32).substr(2, 7);
}

/*Add reminder to object, push into reminder list, and send reminder to DB*/

let addReminder = (title, text, date) => {
  let reminderObj = {
    title,
    text,
    date,
    id: ID(),
    checked: false,
    deleted: false
  }
  reminderItems.unshift(reminderObj);
  addToDB(reminderObj, 'POST');
}

/**
 * Open and close app window
 * Load data from db when app window opens. Only pull entries from database on
 * window toggle when reminderItems array is empty to prevent duplicate entries
 * when window is open and closed. ReminderItems mirrors what is on the output list
 * */
window.addEventListener('load', (e) => {
  if (toggleAppIconBar === false) {
    formElements.dateElement.min = formElements.setMinInputDate();
    formElements.clearFields_Validation();

    toggleAppIconBar = true;
    if (reminderItems.length < 1) {
      fetch('/reminderAppData')
        .then(response => response.json())
        .then(data => {
          data.forEach((reminderObj, item, arr) => {
            reminderItems.push(reminderObj); // list of reminders loaded in from DB on window load
            renderReminder(reminderObj);
          });
        })
        .catch(error => console.log('error'));
    }
    formElements.button.addEventListener('click', formControl);
  }
});

formElements.closeButton.addEventListener('click', (event) => {
  if (toggleAppIconBar === true) {
    let overlay = document.querySelector('.overlay');
    let appContent = document.querySelector('.reminder-app');
    overlay.classList.remove('active');
    appContent.classList.remove('active');
    toggleAppIconBar = false;
  }
});


function formControl(e) {
  e.preventDefault();
  formElements.dateElement.classList.remove('validation');
  formElements.textElement.classList.remove('validation');
  formElements.titleElement.classList.remove('validation');

  let titleValue = formElements.titleElement.value.trim();
  let textValue = formElements.textElement.value.trim();
  let dateValue = formElements.dateElement.value;

  if ((titleValue || textValue !== '') && dateValue !== '') {
    addReminder(titleValue, textValue, dateValue);
    formElements.clearFields_Validation();
    formElements.titleElement.focus();
  } else {
    if (dateValue === '') {
      formElements.dateElement.classList.add('validation');
    }
    if (titleValue === '') {
      formElements.titleElement.classList.add('validation');
    }
    if (textValue === '') {
      formElements.textElement.classList.add('validation');
    }
  }
}