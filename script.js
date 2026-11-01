$(document).ready(function () {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
  $('.current-date').text(formattedDate);

  // Load saved data from localStorage when the page opens
  loadSavedData();
});

// Button to add new field for plus amount
$('.btn-add-srvice').on('click', function (e) {
  e.preventDefault();
  addRow('', '', 'priceadd', 'btn-outline-success', '+');
  saveDataToLocalStorage();
});

// Button to add new field for minus amount
$('.btn-minus-srvice').on('click', function (e) {
  e.preventDefault();
  addRow('', '', 'priceminus', 'btn-outline-danger', '-');
  saveDataToLocalStorage();
});

// Helper function to create rows dynamically
function addRow(desc = '', price = '', priceId = '', btnClass = '', btnSymbol = '') {
  $('#attributes_area').append(
    '<div class="row mb-2">' +
    '<div class="col col-md-1"><button type="button" class="btn ' + btnClass + ' hide-pdf">' + btnSymbol + '</button></div>' +
    '<div class="col col-md-7"><input type="text" name="description[]" class="form-control desc-input" placeholder="Description" value="' + desc + '"></div>' +
    '<div class="col col-md-2"><input type="text" name="price[]" id="' + priceId + '" class="form-control price" placeholder="Amount" value="' + price + '"></div>' +
    '<div class="col col-md-1"><button type="button" id="DeleteRow" class="btn btn-danger hide-pdf">Delete</button></div>' +
    '</div>');
}

// Remove field and update storage
$("body").on("click", "#DeleteRow", function () {
  $(this).parents(".row").remove();
  saveDataToLocalStorage();
  calculateTotal();
});

// Reset / Clear All Button Handler
$(document).on('click', '.btn-reset', function (e) {
  e.preventDefault();
  if (confirm("Are you sure you want to clear all data and start over?")) {
    // Remove all dynamically added row elements
    $('#attributes_area .row').remove();
    // Clear localStorage
    localStorage.removeItem('saved_income_expense_rows');
    // Reset total to 0
    total = 0;
    document.getElementById("total").innerHTML = "0";
  }
});

// Save data automatically whenever an input changes
$(document).on('input', '.desc-input, .price', function () {
  saveDataToLocalStorage();
});

// Calculate values and find total
let total = 0;
$(document).on('click', ".equal", function () {
  calculateTotal();
});

function calculateTotal() {
   let atotal = 0;
   let mtotal = 0;
  $('.price').each(function(){
    let idname = this.getAttribute('id');
    if(idname == "priceadd" && !isNaN(parseFloat($(this).val()))){
      atotal +=  parseFloat($(this).val());
    }else if(idname == "priceminus" && !isNaN(parseFloat($(this).val()))){ 
      mtotal +=  parseFloat($(this).val());
    }
  });
  
  total = atotal - mtotal; 

  // Determine text based on whether total is positive or negative
  let labelText = "";
  if (total > 0) {
      labelText = " কম"; // More (Positive)
  } else if (total < 0) {
      labelText = " বেশি";  // Less (Negative)
  }

  // Display the total number along with the corresponding Bangla word
  document.getElementById("total").innerHTML = total + labelText;
}

// --- LOCAL STORAGE FUNCTIONS ---

function saveDataToLocalStorage() {
  let rows = [];
  $('#attributes_area .row').each(function () {
    let desc = $(this).find('.desc-input').val();
    let price = $(this).find('.price').val();
    let priceId = $(this).find('.price').attr('id');
    let btnClass = $(this).find('.hide-pdf').first().hasClass('btn-outline-success') ? 'btn-outline-success' : 'btn-outline-danger';
    let btnSymbol = $(this).find('.hide-pdf').first().text();

    rows.push({ desc, price, priceId, btnClass, btnSymbol });
  });
  localStorage.setItem('saved_income_expense_rows', JSON.stringify(rows));
}

function loadSavedData() {
  let savedRows = localStorage.getItem('saved_income_expense_rows');
  if (savedRows) {
    let rows = JSON.parse(savedRows);
    rows.forEach(r => {
      addRow(r.desc, r.price, r.priceId, r.btnClass, r.btnSymbol);
    });
    calculateTotal();
  }
}

// Save as PDF using html2canvas
window.jsPDF = window.jspdf.jsPDF;
function generatePdf() {
  $('.hide-pdf').hide();

  const elementHTML = document.querySelector("#attributes_area");
  const date = (new Date()).toString().split(' ').splice(1, 3).join('-');

  html2canvas(elementHTML, {
    scale: 2,
    windowWidth: 1200
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    var doc = new jsPDF('p', 'mm', 'a4');

    var imgWidth = 200;
    var imgHeight = (canvas.height * imgWidth) / canvas.width;
    var position = 17;

    doc.addImage(imgData, 'PNG', 17, position, imgWidth, imgHeight);
    doc.save(date + '.pdf');

    $('.hide-pdf').show();
  });
};
