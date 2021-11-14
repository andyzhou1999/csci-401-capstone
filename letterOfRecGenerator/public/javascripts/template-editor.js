let Embed = Quill.import('blots/embed');

var questionID = 0;
// array of tags
var tagArray = [];

class SpanEmbed extends Embed {
  static create(value) {
    const node = super.create();
    node.classList.add('span-insert');
    node.setAttribute('data-type', value.value);
    node.innerText = " " + value.value + " ";
    return node;
  }

  static value(node) {
    return {
      value: node.getAttribute('data-type')
    };
  }
}

window.onload = function () {
  // Quill initialization
  SpanEmbed.blotName = 'spanEmbed';
  SpanEmbed.tagName = 'span';
  Quill.register(SpanEmbed);

  // Prefilled  questions
  createCard("What is your first name?", "First Name", null, null);
  createCard("What is your last name?", "Last Name", null, null);
  createCard("What is your preferred personal pronoun (subject)?", "Pronoun (subject)", null, null);
  createCard("What is your preferred personal pronoun (object)?", "Pronoun (object)", null, null);
  createCard("What is your preferred possessive pronoun?", "Possessive Pronoun", null, null);
  document.activeElement.blur();
};

// Show options if checkbox or multiple choice is selected
document.querySelector("form").addEventListener("change", (event) => {
  // console.log(event.target);

  if (event.target.classList.contains("form-select")) {
    var select = event.target;
    var value = select.options[select.selectedIndex].value;
    if (value == "Radio Button") {
      var selectedCard = event.target.closest(".card");
      selectedCard.querySelector(".options").classList.remove("d-none");
      selectedCard.querySelector(".seperate-tag-options").classList.add("d-none");
      selectedCard.querySelector(".normal-tag").classList.remove("d-none");



    }
    else if(value == "Checkbox"){
      var selectedCard = event.target.closest(".card");
      selectedCard.querySelector(".options").classList.add("d-none");
      selectedCard.querySelector(".seperate-tag-options").classList.remove("d-none");
      selectedCard.querySelector(".normal-tag").classList.add("d-none");
    }
    else {
      var selectedCard = event.target.closest(".card");
      selectedCard.querySelector(".options").classList.add("d-none");
      selectedCard.querySelector(".seperate-tag-options").classList.add("d-none");
      selectedCard.querySelector(".normal-tag").classList.remove("d-none");
    }
  }
});

// Handles click events inside form element
document.querySelector("form").addEventListener("click", (event) => {

  if(event.target.id == "template-name")
    return;

  console.log(tagArray);

  var selectedCard = event.target.closest(".card");

  if(selectedCard.id == "question-box")
    return;
  var select = selectedCard.children.item(0);
  select = select.children.item(1);
  select = select.children.item(0);
  console.log(selectedCard);
  console.log(select);

  var value = select.value;
  // Add option to question
  if (event.target.classList.contains("add-options-btn")) {
    
    if(value == "Radio Button"){
      addOption(event);
    }
    else{
      addSeperateTagOption(event);
    }
    
  }

  // Delete option from question
  var targetElem = event.target.closest(".col-radio-delete");
  if (targetElem) {
    var card = event.target.closest(".card");
    if(value == "Radio Button"){
      deleteOption(targetElem);
    }
    else{
      deleteSeperateTagOption(targetElem);
    }
   
    var addButtons = card.querySelectorAll(".add-options-btn");
    addButtons[1].classList.remove("d-none");

  }

  // Delete question from form
  if (event.target.classList.contains("delete-question-icon")) {
    // Deleting corresponding tag if any
    console.log(tagArray);
    console.log(event.target.id);

    if(value =="Radio Button"){
      var id = parseInt(event.target.id,10);
      var index = tagArray.indexOf(id);
      console.log(index);
      if (index != -1) {
        tagArray.splice(index, 1);
        var tag = document.querySelector("#t" + id);
        tag.remove();
        
      }
      event.target.closest(".card").remove();
    }
    else{
      var id = parseInt(event.target.id, 10);
      var numOptions = event.target.closest(".card");
      numOptions = numOptions.children.item(2);
      numOptions = numOptions.childElementCount;
      numOptions -= 1;
      
      for(var i = 1 ; i <= numOptions ; ++i){
        var target_id = id + i;
        var index = tagArray.indexOf(target_id);
        if (index != -1) {
          tagArray.splice(index, 1);
          console.log(target_id);
          var tag = document.querySelector("#t" + target_id);
          tag.remove();      
        }
      }
      var index = tagArray.indexOf(id);
      tagArray.splice(index, 1);
      event.target.closest(".card").remove();
    }

    console.log(tagArray);
  }
});



// Handles input events inside text editor
document.querySelector("#editor").addEventListener("input", (event) => {
  document.querySelector("#editor").classList.remove("editor-is-invalid");
});

// Adds option element
function addOption(event) {
  // Check if there is only one option, if so, show delete button
  var targetOptions = event.target.closest(".options");
  var optionsCount = targetOptions.childElementCount - 1;
  if (optionsCount == 1) {
    targetOptions.querySelector(".col-radio-delete").classList.remove("d-none");
  }

  // Find options div of current card
  var selectedOptions = event.target.closest(".options");

  var newOption = document.createDocumentFragment();

  var row = document.createElement("div");
  row.classList.add("row");

  var col1 = document.createElement("div");
  col1.classList.add("col-radio-input");

  var col2 = document.createElement("div");
  col2.classList.add("col-radio-delete");

  var input = document.createElement("input");
  input.type = "text";
  input.classList.add("form-control", "option-input");
  input.placeholder = "Option";

  var icon = document.createElement("i");
  icon.classList.add("fas", "fa-times");

  col1.appendChild(input);
  col2.appendChild(icon);
  row.appendChild(col1);
  row.appendChild(col2);
  newOption.appendChild(row);

  // Inserts new option before add option button
  var buttonRow = event.target.closest(".row");
  selectedOptions.insertBefore(newOption, buttonRow);
}

function addSeperateTagOption(event) {
  var targetOptions = event.target.closest(".seperate-tag-options");
  console.log(event.target);
  console.log(targetOptions);
  var optionsCount = targetOptions.childElementCount - 1;
  if (optionsCount == 1) {
    targetOptions.querySelector(".col-radio-delete").classList.remove("d-none");
  }

  if(optionsCount >= 8){
    event.target.classList.add("d-none");
  }


  // Find options div of current card
  var selectedOptions = event.target.closest(".seperate-tag-options");

  var firstTag = selectedOptions.children.item(0);
  firstTag = firstTag.children.item(1);
  firstTag = firstTag.children.item(0);

  var firstTagID = firstTag.id;


  var newOption = document.createDocumentFragment();

  var row = document.createElement("div");
  row.classList.add("row");

  var col1 = document.createElement("div");
  col1.classList.add("col-radio-input", "col-6");

  var col2 = document.createElement("div");
  col2.classList.add("col-radio-delete");

  var input = document.createElement("input");
  input.type = "text";
  input.classList.add("form-control", "option-input");
  input.placeholder = "Option";

  var col_tag_input = document.createElement("div");
  col_tag_input.classList.add("col-tag-input", "col-5");
  
  var seperate_tag_input = document.createElement("input");
  seperate_tag_input.type = "text";
  seperate_tag_input.classList.add("form-control");
  seperate_tag_input.classList.add("tag-input");
  seperate_tag_input.setAttribute("data-value", "");
  seperate_tag_input.placeholder = "Tag";
  seperate_tag_input.value = "";
  // Adding Unique ID to dynamically created question
  seperate_tag_input.id = "i" + (parseInt(firstTagID.substr(1)) + parseInt(optionsCount));

  var tag_container = document.querySelector(".tags");

  boilerTag = document.createElement("div");
  boilerTag.classList.add("col-sm-auto");
  boilerTag.classList.add("tag");
  boilerTag.id = "t" + seperate_tag_input.id.substr(1);
  boilerTag.innerHTML = "";
  boilerTag.setAttribute("data-value", "tagVal");

  tagArray.push(parseInt(seperate_tag_input.id.substr(1)));

  tag_container.appendChild(boilerTag);

  // Hide tag if blank
  if (boilerTag.innerHTML == "") {
    boilerTag.classList.add("d-none");
  }
  

  var icon = document.createElement("i");
  icon.classList.add("fas", "fa-times");

  col1.appendChild(input);
  col2.appendChild(icon);
  col_tag_input.appendChild(seperate_tag_input);

  row.appendChild(col1);
  row.appendChild(col_tag_input);
  row.appendChild(col2);
  newOption.appendChild(row);

  // Inserts new option before add option button
  var buttonRow = event.target.closest(".row");
  selectedOptions.insertBefore(newOption, buttonRow);
}

// Delete option
function deleteOption(targetElem) {
  // Check if there is at least on option left, subtract one for options button
  var targetOptions = targetElem.closest(".options");
  var optionsCount = targetOptions.childElementCount - 1;
  if (optionsCount > 1) {
    targetElem.closest(".row").remove();
    if (optionsCount == 2) {
      targetOptions.querySelector(".col-radio-delete").classList.add("d-none");
    }
  }
}

function deleteSeperateTagOption(targetElem) {
  // Check if there is at least on option left, subtract one for options button
  var targetOptions = targetElem.closest(".seperate-tag-options");
  var optionsCount = targetOptions.childElementCount - 1;
  if (optionsCount > 1) {
    var targetTagInput = targetElem.closest(".row");
    targetTagInput = targetTagInput.children.item(1);
    targetTagInput = targetTagInput.children.item(0);
    targetTagID = targetTagInput.id.substr(1);


    // Remove tag from tag boilerplate
    var tag = document.querySelector("#t" + targetTagID);
    tag.remove();

    var index = tagArray.indexOf(parseInt(targetTagID));
    console.log(index);
    if (index != -1) {
      tagArray.splice(index, 1);
    }

    targetElem.closest(".row").remove();
    if (optionsCount == 2) {
      targetOptions.querySelector(".col-radio-delete").classList.add("d-none");
    }
  }
}

// Add question
document.querySelector(".add-questions-btn").addEventListener("click", (event) => {
  createCard("", "", null);
});

// Args string, string, array of strings, array of strings
function createCard(questionVal, tagVal, optionsVal, tagsVal) {

  var form = document.querySelector("form");

  var newQuestion = document.createDocumentFragment();

  // Create question and dropdown
  var card = document.createElement("div");
  card.classList.add("card", "container", "align-middle");

  var question = document.createElement("div");
  question.classList.add("row");

  var col1 = document.createElement("div");
  col1.classList.add("col-8");

  var ques_input = document.createElement("input");
  ques_input.type = "text";
  ques_input.classList.add("form-control", "question-input");
  ques_input.placeholder = "Question";
  ques_input.value = questionVal;

  var col2 = document.createElement("div");
  col2.classList.add("col-4");

  var select = document.createElement("select");
  select.classList.add("form-select");

  var option1 = document.createElement("option");
  option1.value = "Text";
  option1.innerHTML = "Text";
  var option2 = document.createElement("option");
  option2.value = "Radio Button";
  option2.innerHTML = "Radio Button";
  var option3 = document.createElement("option");
  option3.value = "Checkbox";
  option3.innerHTML = "Checkbox";

  select.appendChild(option1);
  select.appendChild(option2);
  select.appendChild(option3);

  col2.appendChild(select);
  col1.appendChild(ques_input);

  question.appendChild(col1);
  question.appendChild(col2);

  // Create options section

  var options = document.createElement("div");
  
  if (optionsVal == null) {
    options.classList.add("options", "d-none");

    var row1 = document.createElement("row");
    row1.classList.add("row");

    var col_input = document.createElement("div");
    col_input.classList.add("col-radio-input");

    var opt_input = document.createElement("input");
    opt_input.type = "text";
    opt_input.classList.add("form-control", "option-input");
    opt_input.placeholder = "Option";

    var col_delete = document.createElement("div");
    col_delete.classList.add("col-radio-delete", "d-none");

    var del_option_icon = document.createElement("i");
    del_option_icon.classList.add("fas", "fa-times");

    col_delete.appendChild(del_option_icon);
    col_input.appendChild(opt_input);

    row1.appendChild(col_input);
    row1.appendChild(col_delete);

    options.appendChild(row1);
  }
  else {
    for (var i=0; i<optionsVal.length; ++i) {
      var row1 = document.createElement("row");
      row1.classList.add("row");

      var col_input = document.createElement("div");
      col_input.classList.add("col-radio-input");

      var opt_input = document.createElement("input");
      opt_input.type = "text";
      opt_input.classList.add("form-control", "option-input");
      opt_input.placeholder = "Option";
      opt_input.value = optionsVal[i];

      var col_delete = document.createElement("div");
      col_delete.classList.add("col-radio-delete", "d-none");

      var del_option_icon = document.createElement("i");
      del_option_icon.classList.add("fas", "fa-times");

      col_delete.appendChild(del_option_icon);
      col_input.appendChild(opt_input);

      row1.appendChild(col_input);
      row1.appendChild(col_delete);

      options.appendChild(row1);
    }
  }

  var row2 = document.createElement("row");
  row2.classList.add("row");

  var col_input2 = document.createElement("div");
  col_input2.classList.add("col-radio-input");

  var add_opt_button = document.createElement("button");
  add_opt_button.type = "button";
  add_opt_button.classList.add("add-btn", "add-options-btn");
  add_opt_button.innerHTML = "Add Option";

  col_input2.appendChild(add_opt_button);
  row2.appendChild(col_input2);

  options.appendChild(row2);

  // Creates Seperate Tag options

  var seperate_tag_options = document.createElement("div");

  if (optionsVal == null) {
    seperate_tag_options.classList.add("seperate-tag-options", "d-none");
    var row1 = document.createElement("row");
    row1.classList.add("row");

    var col_input = document.createElement("div");
    col_input.classList.add("col-radio-input", "col-6");

    var opt_input = document.createElement("input");
    opt_input.type = "text";
    opt_input.classList.add("form-control", "option-input");
    opt_input.placeholder = "Option";

    var col_tag_input = document.createElement("div");
    col_tag_input.classList.add("col-tag-input", "col-5");
    
    var seperate_tag_input = document.createElement("input");
    seperate_tag_input.type = "text";
    seperate_tag_input.classList.add("form-control");
    seperate_tag_input.classList.add("tag-input");
    seperate_tag_input.setAttribute("data-value", "");
    seperate_tag_input.placeholder = "Tag";
    seperate_tag_input.value = null;
    // Adding Unique ID to dynamically created question
    seperate_tag_input.id = "i" + (questionID + 1);

    tagArray.push(parseInt(seperate_tag_input.id.substr(1)));

    var col_delete = document.createElement("div");
    col_delete.classList.add("col-radio-delete", "d-none", "col-1");

    var del_option_icon = document.createElement("i");
    del_option_icon.classList.add("fas", "fa-times");

    col_delete.appendChild(del_option_icon);
    col_input.appendChild(opt_input);

    col_tag_input.appendChild(seperate_tag_input);

    row1.appendChild(col_input);
    row1.appendChild(col_tag_input);
    row1.appendChild(col_delete);

    seperate_tag_options.appendChild(row1);

    var tag_container = document.querySelector(".tags");

    boilerTag = document.createElement("div");
    boilerTag.classList.add("col-sm-auto");
    boilerTag.classList.add("tag");
    boilerTag.id = "t" + seperate_tag_input.id.substr(1);
    boilerTag.innerHTML = null;
    boilerTag.setAttribute("data-value", null);

    tag_container.appendChild(boilerTag);

    // Hide tag if blank
    if (boilerTag.innerHTML == "") {
      boilerTag.classList.add("d-none");
    }

  }
  else {
    
    for (var i=1; i<=optionsVal.length; ++i) {
      var row1 = document.createElement("row");
      row1.classList.add("row");

      var col_input = document.createElement("div");
      col_input.classList.add("col-radio-input", "col-6");

      var opt_input = document.createElement("input");
      opt_input.type = "text";
      opt_input.classList.add("form-control", "option-input");
      opt_input.placeholder = "Option";
      opt_input.value = optionsVal[i];

      var col_tag_input = document.createElement("div");
      col_tag_input.classList.add("col-tag-input", "col-5");

      var seperate_tag_input = document.createElement("input");
      seperate_tag_input.type = "text";
      seperate_tag_input.classList.add("form-control");
      seperate_tag_input.classList.add("tag-input");
      seperate_tag_input.setAttribute("data-value", "");
      seperate_tag_input.placeholder = "Tag";
      seperate_tag_input.value = tagsVal[i];
      // Adding Unique ID to dynamically created question
      seperate_tag_input.id = "i" + (parseInt(questionID) + parseInt(i));

      tagArray.push(parseInt(seperate_tag_input.id.substr(1)));
      
      var col_delete = document.createElement("div");
      col_delete.classList.add("col-radio-delete", "d-none" , "col-1");

      var del_option_icon = document.createElement("i");
      del_option_icon.classList.add("fas", "fa-times");

      col_delete.appendChild(del_option_icon);
      col_input.appendChild(opt_input);

      col_tag_input.appendChild(seperate_tag_input);

      row1.appendChild(col_input);
      row1.appendChild(col_tag_input);
      row1.appendChild(col_delete);

      seperate_tag_options.appendChild(row1);

      var tag_container = document.querySelector(".tags");

      boilerTag = document.createElement("div");
      boilerTag.classList.add("col-sm-auto");
      boilerTag.classList.add("tag");
      boilerTag.id = "t" + seperate_tag_input.id.substr(1);
      boilerTag.innerHTML = tagsVal[i];
      boilerTag.setAttribute("data-value", tagVal);

      tag_container.appendChild(boilerTag);

      // Hide tag if blank
      if (boilerTag.innerHTML == "") {
        boilerTag.classList.add("d-none");
      }
    }
  }

  var row2 = document.createElement("row");
  row2.classList.add("row");

  var col_input2 = document.createElement("div");
  col_input2.classList.add("col-radio-input");

  var add_opt_button = document.createElement("button");
  add_opt_button.type = "button";
  add_opt_button.classList.add("add-btn", "add-options-btn");
  add_opt_button.innerHTML = "Add Option";

  col_input2.appendChild(add_opt_button);
  row2.appendChild(col_input2);

  seperate_tag_options.appendChild(row2);

  // Creates tag section and question delete icon

  var tag = document.createElement("div");
  tag.classList.add("row");

  var col3 = document.createElement("div");
  col3.classList.add("col-4");

  var tag_input = document.createElement("input");
  tag_input.type = "text";
  tag_input.classList.add("form-control", "normal-tag");
  tag_input.classList.add("tag-input");
  tag_input.setAttribute("data-value", "");
  tag_input.placeholder = "Tag";
  tag_input.value = tagVal;
  // Adding Unique ID to dynamically created question
  tag_input.id = "i" + questionID;

  var tag_container = document.querySelector(".tags");

  boilerTag = document.createElement("div");
  boilerTag.classList.add("col-sm-auto");
  boilerTag.classList.add("tag");
  boilerTag.id = "t" + questionID;
  boilerTag.innerHTML = tagVal;
  boilerTag.setAttribute("data-value", tagVal);

  tagArray.push(questionID);

  tag_container.appendChild(boilerTag);

  // Hide tag if blank
  if (boilerTag.innerHTML == "") {
    boilerTag.classList.add("d-none");
  }

  var col4 = document.createElement("div");
  col4.classList.add("col", "align-self-end");

  var icon = document.createElement("i");
  icon.classList.add("fas", "fa-trash", "float-end", "delete-question-icon");
  // Adding Unique ID to dynamically created question's delete button
  icon.id = questionID;
  questionID += 10;

  col4.appendChild(icon);
  col3.appendChild(tag_input);

  tag.appendChild(col3);
  tag.appendChild(col4);

  card.appendChild(question);
  card.appendChild(options);
  card.appendChild(seperate_tag_options);
  card.appendChild(tag);

  form.appendChild(card);

  ques_input.focus();
}

// Handles form input events
document.querySelector("form").addEventListener("input", function (event) {
  event.preventDefault();

  if (event.target.value.length == 0) {
    event.target.classList.add("is-invalid");
  }
  else {
    event.target.classList.remove("is-invalid");
  }

  // Tag generation from Question on tag input
  if (event.target && event.target.classList.contains("tag-input")) {
    var tag_inputs = document.querySelectorAll(".tag-input");
    for (var i = 0; i < tag_inputs.length; i++) {
      if(tag_inputs[i].value != ""){
        tag_inputs[i].classList.remove("is-invalid");
      }   
    }
    var tag;

    tag = document.querySelector("#t" + event.target.id.substr(1));
    tag.innerHTML = event.target.value;
    tag.setAttribute("data-value", event.target.value);
 

    // Check inserted tags and remove error if tag matches
    var tagInserts = document.querySelectorAll(".span-insert");
    for (var i=0; i<tagInserts.length; ++i) {
      if (tagInserts[i].getAttribute("data-type") === tag.innerHTML) {
        tagInserts[i].classList.remove("span-insert-is-invalid");
      }
    }

    // Tag validation
    for (var i = 0; i < tagArray.length; i++) {
      var temp = document.querySelector("#t" + tagArray[i]);
      if(temp.innerHTML != ""){
        temp.classList.remove("d-none");
      }  
    }

    // Hide tag if blank
    if (tag.innerHTML == "") {
      tag.classList.add("d-none");
    }
    
    // Hide tags if duplicate tags exist
    for (var j=0; j<tagArray.length; j++) {
      var cur_tag = document.querySelector("#t" + tagArray[j]);
      for (var i = 0; i < tagArray.length; i++) {
        if (!(cur_tag.id === "t" + tagArray[i])) {
          var other_tag = document.querySelector("#t" + tagArray[i]);
          if (other_tag.innerHTML === cur_tag.innerHTML) {
            cur_tag.classList.add("d-none");
            other_tag.classList.add("d-none");
            isUnique = 1;
            console.log(event.target.id.substr(1));
            console.log(cur_tag.id);
            if(event.target.id.substr(1) == cur_tag.id.substr(1) || event.target.id.substr(1) == other_tag.id.substr(1)){
              event.target.classList.add("is-invalid");
              // console.log(event.target);
              // console.log("asdsa" + event.target.id + " " + cur_tag.id + " " + other_tag.id);
              break;
            }      
          }
          else {
            event.target.classList.remove("is-invalid");
          }
        }
      }
    }

    for(var i = 0 ; i < tagArray.length ; i++){
      if(tagArray[i] != event.target.id.substr(1)){
        cur_tag = document.querySelector("#t" + tagArray[i]);
        if(cur_tag.innerHTML === event.target.value){
          event.target.classList.add("is-invalid");
        }
      }
    }

  }
});


// Tag insert
document.querySelector(".tags").addEventListener("click", (event) => {
  event.preventDefault();
  if (event.target.classList.contains("tag")) {
    // console.log("click tag");

    quill.focus();
    var range = quill.getSelection();
    while (!range) { };
    if (range) {
      // console.log(range.index);
      quill.insertEmbed(range.index, 'spanEmbed' ,  { value: event.target.getAttribute('data-value')});
      quill.setSelection(range.index + 1);
      quill.insertText(range.index + 1, ' ', Quill.sources.SILENT);
      document.querySelector("#editor").classList.remove("editor-is-invalid");
    }
  }
});



// Save template
document.querySelector(".save-btn").addEventListener("click", (event) => {

  // Form validation
  var hasError = 0;
  // Check template name
  var template_name = document.querySelector("#template-name");
  if (template_name.value.length == 0) {
    hasError = 1;
    template_name.classList.add("is-invalid");
  }

  // Check questions
  var questions = document.querySelectorAll(".question-input");
  for (var i = 0; i < questions.length; i++) {
    // console.log(questions[i].value);
    if (questions[i].value.length == 0) {
      hasError = 1;
      questions[i].classList.add("is-invalid");
    }
  }

  // Check options
  var options = document.querySelectorAll(".option-input");
  // console.log(options);
  for (var i = 0; i < options.length; i++) {
    // console.log(options[i].value);
    if (options[i].value.length == 0) {
      // console.log(options[i].closest(".options"));

      var options_div = options[i].parentNode;
      options_div = options_div.parentNode;
      options_div = options_div.parentNode;

      if (!options_div.classList.contains("d-none")) {
        hasError = 1;
        options[i].classList.add("is-invalid");
      }
    }
  }

  // Check duplicate tags 
  var tag_inputs = document.querySelectorAll(".tag-input");
  for (var i = 0; i < tag_inputs.length; i++) {
    tag_inputs[i].classList.remove("is-invalid");
  }

  for (var i = 0; i < tag_inputs.length; i++) {
    for(var j = 0 ; j < tag_inputs.length ; j++){

      var options_div = tag_inputs[i].parentNode.parentNode.parentNode;
      var options_div2 = tag_inputs[j].parentNode.parentNode.parentNode;
      
      if(i != j && !options_div.classList.contains("d-none") && !options_div2.classList.contains("d-none")){
        if(tag_inputs[i].value === tag_inputs[j].value){
          tag_inputs[i].classList.add("is-invalid");
          tag_inputs[j].classList.add("is-invalid");
          hasError = 1;
        }
      }
    }
  }

  // Check Empty Tag
  
  // console.log(tag_inputs);
  for (var i = 0; i < tag_inputs.length; i++) {
    if(tag_inputs[i].value == ""){
      tag_inputs[i].classList.add("is-invalid");
    }   
  }

  if (hasError) {
    alert("There are missing or invalid fields");
  }

  // Check text editor
  var delta = quill.getContents();
  if (quill.getLength() == 1) {
    if (!hasError) {
      var confirm = window.confirm("Text editor is blank. Are you sure you want to continue?");
    }
    document.querySelector("#editor").classList.add("editor-is-invalid");
    if (!confirm) {
      return;
    }
  }

  var tagError = parseEditor();
  parseEditorHTML();
  if (!hasError && tagError) {
    alert("Some inserted tags do not have corresponding questions.");
    return;
  }
});

// Parse text editor into plain text
// Returns 1 on error, 0 on success
function parseEditor() {
  var hasError = 0;
  var delta = quill.getContents();
  // console.log(delta);
  var contents = delta.ops;
  // console.log(contents);
  // console.log(quill.root.innerHTML)

  var tags = document.querySelectorAll(".tag-input")

  var plainText = "";
  for (var i=0; i<contents.length; ++i) {
    var op = contents[i];
    if (op?.insert?.spanEmbed?.value !== undefined) {
      // Check if tag question still exists
      var found = false;
      tags.forEach((tag) => {
        if (op?.insert?.spanEmbed?.value === tag.value) {
          found = true;
        }
      });

      if (!found) {
        var tagInserts = document.querySelectorAll(".span-insert");
        tagInserts.forEach((tag) => {
          if (op?.insert?.spanEmbed?.value === tag.getAttribute("data-type"))
            tag.classList.add("span-insert-is-invalid")
        });
        return 1;
      }
      else {
        plainText += "<!" + op?.insert?.spanEmbed?.value + ">";
      }
    }
    else {
      plainText += op?.insert;
    }
  }

  // plainText is a string that contains the parsed text editor with tags in <!tag> format
  console.log(plainText);

  return 0;
}

// Parse text editor mainting html format but replacing tags with <!tag>
function parseEditorHTML() {
  var htmlText = quill.root.innerHTML;
  const tagRegexStart = new RegExp(/<span class=\"span-insert\" data-type=\".*?\"><span contenteditable=\"false\">\s/g);
  const tagRegexEnd = new RegExp(/\s<\/span>.*?<\/span>/g);
  
  htmlText = htmlText.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // console.log(htmlText);
  htmlText = htmlText.replaceAll(tagRegexStart, "<!");
  htmlText = htmlText.replaceAll(tagRegexEnd, ">");
  
  // console.log(htmlText);
}

// Add eventListener to info icons
// document.getElementById("default-questions-info").onclick = function (event) {

//   document.getElementById("exampleModalLabel").innerHTML = "Default Questions"
//   document.getElementById("instructions").innerHTML = "Default questions are automatically added to the form and default tags are automatically created for the questions."
//   document.getElementById("open-modal").click();
// }

document.getElementById("additional-questions-info").onclick = function (event) {

  document.getElementById("exampleModalLabel").innerHTML = "Custom Questions"
  document.getElementById("instructions").innerHTML = "Customize questions form the form."
  document.getElementById("open-modal").click();
}