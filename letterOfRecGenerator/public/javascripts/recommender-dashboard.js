//const Template = require("../../models/template");

var current_page = [1];
var records_per_page = 10;
let data;
var timeSortOrder = -1;
var emailSortOrder = -1;
var orgSortOrder = -1;
var templateSortOrder = -1;
var statusSortOrder = -1;

var templateSelect = document.getElementById("template-select");
templateSelect.style.paddingLeft = "5px";

templateSelect.onchange = function () {
  this.style.color = "black";
};

function sortByTime(tableNumber) {
  timeSortOrder *= -1;
  console.log(data[tableNumber]);
  data[tableNumber].sort(function (a, b) {
    var timeA, timeB;

    if (a.meta.submitted) {
      timeB = a.meta.submitted; //switch to timeA if you want to sort from oldest to newest
    } else {
      timeB = a.meta.sent; //switch to timeA if you want to sort from oldest to newest
    }

    if (b.meta.submitted) {
      timeA = b.meta.submitted; //switch to timeB if you want to sort from oldest to newest
    } else {
      timeA = b.meta.sent; //switch to timeB if you want to sort from oldest to newest
    }

    if (timeA == timeB) return 0;
    if (timeA < timeB) return -1 * timeSortOrder;
    if (timeA > timeB) return 1 * timeSortOrder;
  });

  clearTable(tableNumber);
  generateTable(tableNumber);
}

function sortByEmail(tableNumber) {
  emailSortOrder *= -1;

  data[tableNumber].sort(function (a, b) {
    if (a.email == b.email) return 0;
    if (a.email < b.email) return -1 * emailSortOrder;
    if (a.email > b.email) return 1 * emailSortOrder;
  });

  clearTable(tableNumber);
  generateTable(tableNumber);
}

function sortByOrg(tableNumber) {
  orgSortOrder *= -1;

  data[tableNumber].sort(function (a, b) {
    if (a.organization == b.organization) return 0;
    if (a.organization < b.organization) return -1 * orgSortOrder;
    if (a.organization > b.organization) return 1 * orgSortOrder;
  });

  clearTable(tableNumber);
  generateTable(tableNumber);
}

function sortByTemplate(tableNumber) {
  templateSortOrder *= -1;

  data[tableNumber].sort(function (a, b) {
    if (a.template.name == b.template.name) return 0;
    if (a.template.name < b.template.name) return -1 * templateSortOrder;
    if (a.template.name > b.template.name) return 1 * templateSortOrder;
  });

  clearTable(tableNumber);
  generateTable(tableNumber);
}

function sortByStatus(tableNumber) {
  statusSortOrder *= -1;

  data[tableNumber].sort(function (a, b) {
    var statusA, statusB;

    if (a.status == "Complete") {
      statusA = 1;
    } else if (a.status == "Submitted") {
      statusA = 2;
    } else if (a.status == "Sent") {
      statusA = 3;
    }

    if (b.status == "Complete") {
      statusB = 1;
    } else if (b.status == "Submitted") {
      statusB = 2;
    } else if (b.status == "Sent") {
      statusB = 3;
    }

    if (statusA == statusB) return 0;
    if (statusA < statusB) return -1 * statusSortOrder;
    if (statusA > statusB) return 1 * statusSortOrder;
  });

  clearTable(tableNumber);
  generateTable(tableNumber);
}
// When the user clicks on the button, open the modal
function openModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";
}
function openSaveDefaultEmailModal() {
  var modal = document.getElementById("DefaultEmailModal");
  modal.style.display = "block";

  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
function closeModal() {
  var modal = document.getElementById("myModal");
  modal.style.display = "none";
}

function closeSaveModal() {
  var modal = document.getElementById("DefaultEmailModal");
  modal.style.display = "none";

  var modal = document.getElementById("myModal");
  modal.style.display = "block";
}

function saveDefaultTemplate() {
  var subject = document.getElementById("subject").value;
  var body = document.getElementById("body-text").value;
  $.ajax({
    url: "/recommender-dashboard/update",
    data: {
      subject: subject,
      body: body,
    },
    type: "POST",
    complete: function () {
      console.log("worked for saveDefaultTemplate");
    },
    error: function () {
      console.log("error in saveDefaultTemplate");
    },
  });
  closeSaveModal();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  var modal = document.getElementById("myModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function openLetterPreview(params, status) {
  console.log(status);
  console.log(params);
  // Check to see if the status is green, if not then show error dialog
  if (status === "Sent") {
    window.alert(
      "This letter cannot be previewed because the recommendee has not filled out the form!"
    );
  } else {
    window.location.href = getDestinationRoute("/letter-preview", params);
  }
}

// On click for trash icon
function deleteRow(id) {
  $.ajax({
    url: "/recommender-dashboard/delete",
    data: { id },
    type: "POST",
    complete: function () {
      console.log("complete");
      readFilterInputs();
    },
    error: function () {
      console.log("error");
    },
  });
}

function openResponses(params) {
  // Check to see if the status is green, if not then show error dialog
  if (status === "Sent") {
    window.alert(
      "Responses cannot be seen because the recommendee has not filled out the form!"
    );
  } else {
    window.location.href = getDestinationRoute("/response", params);
  }
}

function getDestinationRoute(address, params) {
  return address + "?" + $.param(params);
}

// Decrement page number
function prevPage(tableNumber) {
  if (current_page[tableNumber] > 1) {
    changePage(tableNumber, current_page[tableNumber] - 1);
  }
}

// Increment page number
function nextPage(tableNumber) {
  if (current_page[tableNumber] < numPages(tableNumber)) {
    changePage(tableNumber, current_page[tableNumber] + 1);
  }
}

// Return total number of pages
function numPages(tableNumber) {
  return Math.ceil(data[tableNumber].length / records_per_page);
}

// Change to the page number specified by the page parameter
function changePage(tableNumber, page) {
  // Validate page
  if (page < 1) page = 1;
  if (page > numPages(tableNumber)) page = numPages(tableNumber);

  current_page[tableNumber] = page;

  // Enable/disable buttons
  setPageButtons(tableNumber);

  if (!data[tableNumber].length) {
    // Exit function if there are no recommendations to show
    return;
  }

  // Clear old table
  clearTable(tableNumber);

  // Generate new table
  generateTable(tableNumber);
}

function clearTable(tableNumber) {
  var table = document.getElementById("table" + tableNumber);

  for (var i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

function generateTable(tableNumber) {
  if (!data[tableNumber].length) {
    // Exit function if there are no recommendations to show
    const tb = document.querySelector("#table-body");
    tb.innerHTML =
      '<tr><td colspan="6" style="text-align: center;">No Existing Recommendations</td></tr>';
    return;
  }
  var row_count = 1;

  for (
    var i = (current_page[tableNumber] - 1) * records_per_page;
    i < current_page[tableNumber] * records_per_page;
    i++
  ) {
    generateRow(row_count, i, tableNumber);
    row_count++;
  }
}

function generateRow(row_count, i, tableNumber) {
  if (i < data[tableNumber].length) {
    if (tableNumber == 0) {
      generateRecRow(row_count, i);
    } else if (tableNumber == 1) {
      generateRecTemplateRow(row_count, i);
    } else if (tableNumber == 2) {
      generateEmailTemplateRow(row_count, i);
    }
  } else {
    generateBlankRow(row_count);
  }
}

function generateRecRow(row_count, i) {
  var table = document.getElementById("table0");
  var row = table.insertRow(row_count);
  var cells = [row.insertCell(0)];

  for (var j = 1; j < 6; j++) {
    cells.push(row.insertCell(j));
  }

  if (!data[0][i].meta.submitted) {
    cells[0].innerHTML =
      new Date(data[0][i].meta.sent).toDateString() +
      "<br>" +
      new Date(data[0][i].meta.sent).toLocaleTimeString("en-US");
  } else {
    cells[0].innerHTML =
      new Date(data[0][i].meta.submitted).toDateString() +
      "<br>" +
      new Date(data[0][i].meta.sent).toLocaleTimeString("en-US");
  }

  cells[1].innerHTML = data[0][i].email;
  cells[2].innerHTML = data[0][i].organization;
  cells[3].innerHTML = data[0][i].template.name;
  if (data[0][i].status == "Sent") {
    cells[4].innerHTML = '<img class="icon" src="/images/red_x.png">';
  } else {
    cells[4].innerHTML = '<img class="icon" src="/images/green_checkmark.png">';
  }
  cells[4].classList.add("center");

  //view questionnaire response icon
  cells[5].innerHTML +=
    "<img class='icon clickable' title='View Responses' src='/images/question_mark.png' onclick='openResponses(" +
    JSON.stringify({ id: data[0][i]._id }) +
    ', "' +
    data[0][i].status +
    "\")'>";

  //preview for letter of recommendation
  cells[5].innerHTML +=
    "<img class='icon clickable' title='Preview Letter' src='/images/preview.png' onclick='openLetterPreview(" +
    JSON.stringify({ id: data[0][i]._id }) +
    ', "' +
    data[0][i].status +
    "\")'>";

  //delete the letter
  cells[5].innerHTML +=
    "<img class='icon clickable' title='Delete Letter' src='/images/delete.png' onclick='deleteRow(\"" +
    data[0][i]._id +
    "\")'>";

  cells[5].classList.add("center");
}

function generateBlankRow(row_count) {
  var table = document.getElementById("table0");
  var row = table.insertRow(row_count);
  var cells = [];

  for (var j = 0; j < 6; j++) {
    cells.push(row.insertCell(j));
    cells[j].innerHTML = "";
  }
}

function setPageButtons(tableNumber) {
  var btn_prev = document.getElementById("button-prev" + tableNumber);
  var btn_next = document.getElementById("button-next" + tableNumber);

  if (current_page[tableNumber] == 1 || !data[tableNumber].length) {
    btn_prev.disabled = true;
  } else {
    btn_prev.disabled = false;
  }

  if (
    current_page[tableNumber] == numPages(tableNumber) ||
    !data[tableNumber].length
  ) {
    btn_next.disabled = true;
  } else {
    btn_next.disabled = false;
  }

  for (var i = 1; i <= numPages(tableNumber); i++) {
    if (i == current_page[tableNumber]) {
      document.getElementById("page-" + tableNumber + "-" + i).disabled = true;
    } else {
      document.getElementById("page-" + tableNumber + "-" + i).disabled = false;
    }
  }
}

function createPageButtons(tableNumber) {
  var page_numbers = document.getElementById("page-numbers" + tableNumber);

  page_numbers.innerHTML = "";

  for (var i = 1; i <= numPages(tableNumber); i++) {
    page_numbers.innerHTML +=
      '<button id="page-' +
      tableNumber +
      "-" +
      i +
      '" onclick="javascript:changePage(' +
      tableNumber +
      ", " +
      i +
      ')">' +
      i +
      "</button>";
  }
}
function readFilterInputs() {
  const match = {};
  const dateMatch = {};
  email = document.querySelector("#search-input").value;
  template = document.querySelector("#template-input").value;
  organization = document.querySelector("#org-input").value;
  startdate = document.querySelector("#startdate-input").value;
  enddate = document.querySelector("#enddate-input").value;
  if (email) {
    match.email = email;
  }
  if (template) {
    // console.log('got here');
    // const match_id = Template.findOne({name: template});
    match.template = template;
  }
  if (organization) {
    match.organization = organization;
  }

  if (startdate || enddate) {
    if (startdate) {
      dateMatch.$gte = startdate;
    }
    if (enddate) {
      dateMatch.$lte = enddate;
    }

    match["meta.sent"] = dateMatch;
  }
  search(match);
}

function search(match) {
  $.ajax({
    url: "/forms",
    data: match,
    success: function (response) {
      data = [response.forms];
      console.log({ data });
      createPageButtons(0);
      // Show page 1 initially
      changePage(0, 1);
      sortByTime(0);

      $("#Edit").click(function (e) {
        e.preventDefault();
        document.getElementById("body-text").disabled = false;
        document.getElementById("subject").disabled = false;
        document.getElementById("Edit").disabled = true;
        document.getElementById("Save").disabled = false;
      });
    },
  });
}

document.getElementById("search-div").onsubmit = (e) => {
  e.preventDefault();
  const match = {};
  email = document.querySelector("#search-input").value;
  if (email) {
    match.email = email;
  }
  search(match);
};
$(".filter-input").on("focusout", (e) => {
  e.preventDefault();
  readFilterInputs();
});

document.getElementById("advanced-search-form").onsubmit = (e) => {
  e.preventDefault();
  readFilterInputs();
};

document.getElementById("send-button").onclick = (e) => {
  if (!document.getElementById("email-input-text").value.length) {
    alert("Please enter an email address.");
    e.preventDefault();
  } else if (document.getElementById("template-select").value == "") {
    alert("Please select a template.");
    e.preventDefault();
  }
};

// document.getElementById('clear-selection').onclick = () => {
//     document.getElementById('search-input').value = "";
//     search("");
// }

// document.getElementById('email-form').onsubmit = (e) => {
//     e.preventDefault();
//     document.getElementById('search-input').value = "";
//     search("");
// }

$(".clr-btn").on("click", function () {
  $(this).parent().prev().val("");
  readFilterInputs();
});

// createPageButtons(0);

// // Show page 1 initially
// changePage(0, 1);
