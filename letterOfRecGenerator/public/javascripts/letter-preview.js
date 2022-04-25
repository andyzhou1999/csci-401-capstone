//flag for if user updated the preveiw or not
let updated = false;

var id = parseAttribute("id");

var innerContainer;
var form;
var letterHTML;
var templateData;
var tagRegex = /\<\![a-z0-9_]+\>/gi;

const EMAIL_SUBECT_TEXT_AREA_ID = "email-subject-text-area";
const EMAIL_BODY_TEXT_AREA_ID = "email-body-text-area";
const EMAIL_TEMPLATES = "email-templates";

// Letter Preview Editing
const ADD_QUESTION_MODAL_ID = "add-question-modal";
const LETTER_CONTAINER_ID = "letter-container";
const TRIX_EDITOR = "trix-editor";
const OUTER_CONTAINER = "outer-container";
var edited = false;
var formatted;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
                "November", "December"];

function onLoad() {
  $.ajax({
    url: "/letter-preview/form",
    data: { id },
    type: "GET",
    success: function (data) {
      form = data;
      $.ajax({
        url: "/template-editor/template",
        data: { id: data.template._id, saveSwitchData: true },
        type: "GET",
        success: function (dat) {
          console.log("page load success");
              letterHTML = createLetterPreview(form, form.letter);
        },
      });
    },
    error: function () {
      console.log("error");
    },
  });
}

function getQueryVariable() {
  /*var query = window.location.search.substring(1);
    var vars = query.split("&");
    for(var i=0;i<vars.length;i++){
        var pair = vars[i].split("=");
        if(pair[0] == variable){
            return pair[1];
        }
    }*/
  document.getElementById("id1").value = "cok";
}

/* function showEditModal(clicked) {
  var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
  var element = document.querySelector(TRIX_EDITOR);
  element.value = "";
  element.editor.setSelectedRange([0, 0]);
  element.editor.insertHTML(
    document.getElementById(LETTER_CONTAINER_ID).innerHTML
  );
  var textt = document.getElementsByClassName("attachment__caption");
  modal.style.display = "block";
} */

// Saves, exits, and updates letter preview
/* function saveEditModal() {
  var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
  var element = document.querySelector(TRIX_EDITOR);

  document.getElementById("letter-text").innerText = element.innerText;
  updated = true;
  modal.style.display = "none";
} */

// Closes without changing
/* function cancelEditModal() {
  var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
  modal.style.display = "none";
} */

function saveLetter() {
  var date = document.getElementById("theDate").value;
  var notifyRecommendee = true;
  if (useCustom) {
    var selectedTemplateIndex = document.getElementById("selectTemplate")
      .selectedIndex;
    var templateFilename = document.getElementById("selectTemplate").options[
      selectedTemplateIndex
    ].value;
    $.ajax({
      url: "/letter-preview/prepareLetter",
      data: {
        id: id,
        letter: letterHTML,
        formID: form._id,
        date: date,
        notify: notifyRecommendee,
        fileName: templateFilename,
        preview: updated
          ? document.getElementById("letter-text").innerText
          : "",
      },
      type: "POST",
      success: function (d) {
        console.log("letter saved successfully");
        document.getElementById("save").innerHTML = "Download Letter";
        document.getElementById("save").onclick = downloadLetter;
        alert("Document saved");
        //window.location.href = '/recommender-dashboard';
      },
      error: function () {
        console.log("error saving letter");
      },
    });
  } else {
    $.ajax({
      url: "/letter-preview/prepareLetter",
      data: {
        id: id,
        letter: letterHTML,
        formID: form._id,
        date: date,
        notify: notifyRecommendee,
      },
      type: "POST",
      success: function (d) {
        console.log("letter saved successfully");
        document.getElementById("save").innerHTML = "Download Letter";
        document.getElementById("save").onclick = downloadLetter;
        alert("Document saved");
        //window.location.href = '/recommender-dashboard';
      },
      error: function () {
        console.log("error saving letter");
      },
    });
  }
}

function downloadLetter() {
  event.preventDefault();
  $.ajax({
    url: "/letter-preview/downloads",
    type: "GET",
    success: function (d) {
      console.log("letter download success");
      window.open("/letter-preview/downloads?foo=bar&xxx=yyy");
    },
    error: function () {
      console.log("letter download error");
    },
  });
}

/* function test() {
  $.ajax({
    url: "/letter-preview/test",
    data: {
      id: id,
    },
    type: "POST",
    success: function (d) {
      console.log("success in drive");
      window.location.href = "/recommender-dashboard";
    },
    error: function () {
      console.log("error in drive");
    },
  });
} */

/* function getDestinationRoute(address, params) {
  return address + "?, params=" + params;
} */

// Creates the divs for each item in array
function createLetterPreview(form, letter) {
  //If there exists recommendation letter saved previuosly
  if(form?.savedLetterOps){
    quill.setContents(form?.savedLetterOps);
  }else{ //render recommendation letter by replacing tag with student's response
    let quillOps = form.template.ops;
    var responses = form.responses;
    let tagResponsePair = new Map();
    responses.forEach((i) => {
      tagResponsePair.set(decodeURIComponent(i.tag), i.response);
    });

    quillOps.forEach((op) => {
      if(op.insert?.spanEmbed?.value){
        console.log(op);
        op.insert = tagResponsePair.get(op.insert?.spanEmbed?.value);
      }
    });
    quill.setContents(quillOps);
  }
  /* $(function () {
    var letterContainer = document.createElement("div");
    letterContainer.classList.add("border", "border-secondary", "letterEditor");
    letterContainer.id = LETTER_CONTAINER_ID;
    innerContainer = document.createElement("div");
    innerContainer.id = "print";
    letterContainer.onclick = function (e) {
      showEditModal(this.id);
    };
    letterContainer.style.cursor = "pointer";
    var outerContainer = document.getElementById(OUTER_CONTAINER);

    letterHTML = parseLetter(form);

    innerContainer.innerHTML +=
      '<div id = "letter-text" style="white-space: pre-line">' +
      letterHTML +
      "</div>";

    letterContainer.appendChild(innerContainer);
    outerContainer.appendChild(letterContainer);
    return innerContainer.innerHTML;
  }); */
}
/* function parseLetter(form) {
  //var letter = form.template.parsed;
  var letter_html = form.template.parsedHtmlText;
  var responses = form.responses;
  console.log(responses);

  //replace tags with student's
  responses.forEach((i) => {
    var tag = "<!" + i.tag + ">";
    letter_html = letter_html.replaceAll(tag, i.response);
  });

  var noCapitalization = Array.from(letter_html);
  for (var i = 0; i < noCapitalization.length; i++) {
    // Found ending punctuation that isn't the last letter in the text
    if (
      (noCapitalization[i] == "." ||
        noCapitalization[i] == "?" ||
        noCapitalization[i] == "!") &&
      i != noCapitalization.length - 1
    ) {
      // Make sure exclamation point is not from a tag
      if (
        noCapitalization[i] == "!" &&
        i > 0 &&
        noCapitalization[i - 1] == "<"
      ) {
        continue;
      }

      // Look for the next alphabetical character to capitalize
      var j = i + 1;
      while (
        !(
          (noCapitalization[j] >= "a" && noCapitalization[j] <= "z") ||
          (noCapitalization[j] >= "A" && noCapitalization[j] <= "Z")
        ) &&
        j < noCapitalization.length
      ) {
        j++;
      }

      // Found character to capitalize
      if (j < noCapitalization.length) {
        noCapitalization[j] = noCapitalization[j].toUpperCase();
      }
    }
  }
  return noCapitalization.join("");
} */

function parseEmailLetter(body) {
  $.ajax({
    url: "/email-letter-preview/emailForm",
    data: { id },
    type: "GET",
    success: function (data) {
      form = data.form;
      var letter = body;
      var responses = form.responses;
      var noCapitalization = Array.from(
        letter
          .replace(tagRegex, function (match) {
            var response = responses.find(function (item) {
              return (
                item.tag.localeCompare(match, { sensitivity: "base" }) == 0
              );
            });
            return response ? response.response : "";
          })
          .replace(tagRegex, function (match) {
            var response = responses.find(function (item) {
              return (
                item.tag.localeCompare(match, { sensitivity: "base" }) == 0
              );
            });
            return response ? response.response : "";
          })
      );

      for (var i = 0; i < noCapitalization.length; i++) {
        // Found ending punctuation that isn't the last letter in the text
        if (
          (noCapitalization[i] == "." ||
            noCapitalization[i] == "?" ||
            noCapitalization[i] == "!") &&
          i != noCapitalization.length - 1
        ) {
          // Make sure exclamation point is not from a tag
          if (
            noCapitalization[i] == "!" &&
            i > 0 &&
            noCapitalization[i - 1] == "<"
          ) {
            continue;
          }

          // Look for the next alphabetical character to capitalize
          var j = i + 1;
          while (
            !(
              (noCapitalization[j] >= "a" && noCapitalization[j] <= "z") ||
              (noCapitalization[j] >= "A" && noCapitalization[j] <= "Z")
            ) &&
            j < noCapitalization.length
          ) {
            j++;
          }

          // Found character to capitalize
          if (j < noCapitalization.length) {
            noCapitalization[j] = noCapitalization[j].toUpperCase();
          }
        }
      }

      var parsed_letter = noCapitalization.join("");
      document.getElementById("email-body-text-area").value = parsed_letter;
    },
    error: function () {
      console.log("error in parseLetter");
    },
  });
}

function parseAttribute(attr) {
  return document.currentScript.getAttribute(attr) == "''"
    ? null
    : document.currentScript.getAttribute(attr).replace(/['"]+/g, "");
}

function encodeLetterHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/gi, "<br>")
    .replace(/\t/gi, "&tab");
}

function decodeLetterHTML(text) {
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\<br\>/gi, "\n")
    .replace(/&tab/gi, "&emsp;")
    .replace(/\<span class\="tag"\>/gi, "")
    .replace(/\<\/span\>/gi, "")
    .replace(/\<div\>/gi, "\n")
    .replace(/\<\/div\>/gi, "")
    .replace(/\&nbsp/g, " ");
  // text = text.replace(/\<strong\>\<\!/gi, "<!").replace(/\<\/strong\>/gi, "");
  // text = text.replace(/\<strong\>/gi, "");
  return text;
}

function addEmailHistory() {
  var Email = {
    title: document.getElementById(EMAIL_TEMPLATES).value,
    subject: document.getElementById(EMAIL_SUBECT_TEXT_AREA_ID).value,
    body_text: document.getElementById(EMAIL_BODY_TEXT_AREA_ID).value,
  };

  $.ajax({
    url: "/letter-preview/addEmailHistory",
    data: {
      id: id,
      Email: Email,
    },
    type: "POST",
    complete: function () {
      console.log("complete");
    },
    success: function (data) {
      id = data.id;
      console.log("addEmailHistory success");
      window.location.href = "/history";
    },
    error: function () {
      console.log("addEmailHistory error");
    },
  });
}

function displayTemplate() {
  if (document.getElementById("example-template").style.display == "none") {
    document.getElementById("example-template").style.display = "block";
  } else {
    document.getElementById("example-template").style.display = "none";
  }
}

// $(document).ready(function () {
//   setTimeout(function () {
//     var modal = document.getElementById(ADD_QUESTION_MODAL_ID);
//     var element = document.querySelector(TRIX_EDITOR);
//     element.value = "";
//     element.editor.setSelectedRange([0, 0]);
//     element.editor.insertHTML(innerContainer.innerHTML);
//     var textt = document.getElementsByClassName("attachment__caption");
//     //modal.style.display = "block";
//     saveEditModal();
//   }, 500);
// });

function saveQuill(){
  $.ajax({
    url: "/letter-preview/saveLetter",
    data: {
      id: id,
      savedLetterOps: quill.getContents().ops
    },
    type: "POST",
    success: function (d) {
      console.log("letter saved successfully");
    },
    error: function () {
      console.log("error saving letter");
    },
  });
}

//Download recommendation letter on the front end
async function downloadQuill(){
  //add user input date to recommendation letter
  let date = document.getElementById("theDate").value;
  date = parseDate(date);
  let delta = quill.getContents();
  delta.ops.unshift(
    {
    insert : date
  },{
    attributes : {
      align : "right"
    },
    insert : "\n"
  });
  
  let quillToWordConfig = {
      exportAs: 'blob',
      paragraphStyles: {
        normal : { //change the configuration to single spacing
              paragraph: {
                spacing: {
                    before: 50,
                    after: 50
                }
            }
          }
        }
    };
    
  let docAsBlob = await window.quillToWord.generateWord(delta, quillToWordConfig);
  window.saveAs.saveAs(docAsBlob, 'recommendation-letter.docx');
}

function parseDate(rawDate){
  let arr = [];
  arr = rawDate.split('-');
  year = arr[0];
  month = parseInt(arr[1]);
  day = arr[2];
  let date = months[month-1] + " " + day + ", " + year;
  return date;
}