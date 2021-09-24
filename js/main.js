const $find = document.getElementById('find');
const $form = document.getElementById('form');
const $message = document.getElementById('message');
const $north = document.getElementById('north');
const $south = document.getElementById('south');
const $resultName = document.getElementById('result-name');
const $resultImg = document.querySelector('.result-image');
const $details = document.getElementById('details');
const $resultsAdd = document.getElementById('results-add');
const $detailsAdd = document.getElementById('add-details');
const $catchListButton = document.getElementById('btn-catch');
const $headingButton = document.getElementById('btn-heading');
const $catchList = document.getElementById('catch-entries');

$headingButton.addEventListener('click', () => {
  changeView('find');
});

$catchListButton.addEventListener('click', () => {
  changeView('list');
  setCatchList();
});

function handleAdd() {
  const catchItem = {
    id: data.nextId,
    creatureName: data.creature,
    creatureData: data.response
  };
  data.nextId++;
  data.catchList.unshift(catchItem);
  changeView('list');
// console.log('data.catchList:', data.catchList);
}

$resultsAdd.addEventListener('click', handleAdd);
$detailsAdd.addEventListener('click', handleAdd);

function convertMonth(str) {
  const monthsObj = {
    1: 'January',
    2: 'Febrary',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
  };
  const months = str.split('-');
  const start = months[0]; const end = months[1];
  return `${monthsObj[start]} - ${monthsObj[end]}`;
}

function fillDetails() {
  const { availability, price, icon_uri } = data.response;
  const phrase = data.response['catch-phrase'];
  // const creatureName = name['name-USen'];
  // data.displayName = creatureName;
  document.getElementById('details-name').textContent = data.displayName.toUpperCase();
  const $detailsImg = document.getElementById('details-img');
  $detailsImg.setAttribute('src', icon_uri);
  $detailsImg.setAttribute('alt', data.displayName);
  document.getElementById('phrase').textContent = phrase;
  if (availability.location) {
    document.getElementById('location').textContent = availability.location;
  } else {
    document.getElementById('location').textContent = 'No data available.';
  }

  if (availability.rarity) {
    document.getElementById('rarity').textContent = availability.rarity;
  } else {
    document.getElementById('rarity').textContent = 'No data available.';
  }

  document.getElementById('price').textContent = price;
  if (availability.isAllYear) {
    document.getElementById('available-north').textContent = 'All year';
    document.getElementById('available-south').textContent = 'All year';
  } else {
    const monthsNorth = convertMonth(availability['month-northern']);
    const monthsSouth = convertMonth(availability['month-southern']);
    document.getElementById('available-north').textContent = monthsNorth;
    document.getElementById('available-south').textContent = monthsSouth;
  }
  if (availability.isAllDay || availability.time === '') {
    document.getElementById('time-of-day').textContent = 'All day';
  } else {
    document.getElementById('time-of-day').textContent = availability.time;
  }
}

$details.addEventListener('click', e => {
  fillDetails();
  changeView('details');
});

function checkAvailability(hemisphere) {
  if (data.response.availability.isAllYear) {
    return true;
  }
  const currentMonth = new Date().getMonth() + 1;
  const availability = data.response.availability[`month-array-${hemisphere}`];
  return availability.includes(currentMonth);
}

function displayAvailable(availability, node) {
  if (availability) {
    node.textContent = 'YES';
  } else {
    node.textContent = 'NO';
  }
}

const request = new XMLHttpRequest();
request.responseType = 'json';
request.addEventListener('load', e => {
  // inside this event listener, guaranteed to have a response
  data.response = request.response;
  if (data.response) {
    // handle response
    $message.textContent = null;
    const creatureName = data.response.name['name-USen'];
    data.displayName = creatureName;
    console.log('name USen', data.displayName);
    $resultImg.setAttribute('src', data.response.icon_uri);
    $resultImg.setAttribute('alt', data.displayName);
    $resultName.textContent = creatureName.toUpperCase();
    const availableNorth = checkAvailability('northern');
    const availableSouth = checkAvailability('southern');
    displayAvailable(availableNorth, $north);
    displayAvailable(availableSouth, $south);
    changeView('result');
  } else {
    // show not found message
    $message.textContent = `No information about '${data.creature}'. Try again.`;
  }
  $form.reset();
});

function handleFind(e) {
  // console.log('target',e.target)
  const $selectControl = $form.elements.select;
  const $textControl = $form.elements['text-input'];
  data.type = $selectControl.value;
  const name = $textControl.value.toLowerCase();
  data.creature = name.replaceAll(' ', '_');
  // console.log('creature type:', data.type, 'creature:', data.creature)
  // remove previous results from results view
  $resultImg.setAttribute('src', null);
  $resultImg.setAttribute('alt', null);
  $resultName.textContent = null;
  // send request
  request.open('GET', `https://acnhapi.com/v1/${data.type}/${data.creature}`);
  request.send();
}

$find.addEventListener('click', e => handleFind(e));
