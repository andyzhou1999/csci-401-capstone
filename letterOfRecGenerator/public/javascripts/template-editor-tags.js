$("button[name='tag_buttons']").on("click", function (e) {
    var val = $(this).val();
    var theDiv = document.getElementById("letter-text-area");
    var content = document.createTextNode(val);
    theDiv.appendChild(content);
});

var letterContent = document.getElementById("letter-text-area");
var firstHalf = "";
var secondHalf = "";
var letterContentCursorPos = -1;

letterContent.onclick = function () {
    // creates dummy node to find cursor position
    var target = document.createTextNode("\u0001");
    document.getSelection().getRangeAt(0).insertNode(target);
    var position = letterContent.innerHTML.indexOf("\u0001");
    target.parentNode.removeChild(target);

    letterContentCursorPos = position;
    var letterContentInnerHTML = letterContent.innerHTML;
    firstHalf = letterContentInnerHTML.substring(0, letterContentCursorPos);
    secondHalf = letterContentInnerHTML.substring(letterContentCursorPos);
};

letterContent.onkeyup = function () {
    letterContentCursorPos = letterContent.innerHTML.length;
}

// so you can click tags directly after typing
$("#letter-text-area").focusout(function () {
    var letterContentInnerHTML = letterContent.innerHTML;
    firstHalf = letterContentInnerHTML.substring(0, letterContentCursorPos);
    secondHalf = letterContentInnerHTML.substring(letterContentCursorPos);
});

// oh god oh no plz change me
$(window).click(function (e) {
    renderAllTagButtons();
});

function renderAllTagButtons() {
    // clear old tag buttons
    let tagsContainer = $("#tag-container");
    tagsContainer.empty();
    // create new tags buttons
    let allQuestions = document.querySelectorAll(".question-container");
    for (let currQuestonEle of allQuestions) {
        let questionText = currQuestonEle.querySelector("[data-type='value']").value;
        let allTagsInQuestion = currQuestonEle.querySelectorAll("[data-type='tag']");
        for (var j = 0; j < allTagsInQuestion.length; j++) {
            const currTagValue = allTagsInQuestion[j].value;
            // create button
            const tagValue = currTagValue.substring(currTagValue.lastIndexOf("!") + 1, currTagValue.lastIndexOf(">"));
            if (tagValue) {
                const newButton = createTagButton(tagValue, questionText);
                tagsContainer.append(newButton);
            }
        }
    }
}

function createTagButton(tagValue, questionText) {  
    newButton = $(`<button class="btn btn-outline-dark mr-3 my-1">&lt;!${tagValue}&gt;</button>`);
    newButton.on('click', function () {
        // if clicked and focused, add append to back
        if (letterContentCursorPos === -1) {
            var theDiv = document.getElementById("letter-text-area");
            var content = document.createTextNode(" <!" + tagValue + '>');
            theDiv.appendChild(content);
        } else {
            var entire = firstHalf + "&lt;!" + tagValue + "&gt;" + secondHalf;
            letterContent.innerHTML = entire;

            letterContentCursorPos = -1;
            firstHalf = "";
            secondHalf = "";
        }
        return false;
    });

    // create span child
    let newSpan = createSpanChild(questionText);
    newButton.append(newSpan);
    newButton.onmouseover = function () {
        newSpan.style.visibility = "visible";
    }
    newButton.onmouseout = function () {
        newSpan.style.visibility = "hidden";
    }

    return newButton;
}

function createSpanChild(questionText) {
    let newSpan = document.createElement("span");
    newSpan.className = "popup-text";
    newSpan.style.visibility = "hidden";
    newSpan.style.width = "200px";
    newSpan.style.backgroundColor = "black";
    newSpan.style.color = "#fff";
    newSpan.style.textAlign = "center";
    newSpan.style.padding = "5px 0";
    newSpan.style.borderRadius = "6px";
    newSpan.style.position = "absolute";
    newSpan.style.zIndex = "1";
    newSpan.style.marginLeft = "-100px";
    newSpan.style.marginTop = "20px";
    newSpan.innerHTML = questionText;
    return newSpan;
}