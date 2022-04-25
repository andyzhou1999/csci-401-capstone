//load country names and phone codes
let countryData;

let fileName = [];
let fileData = [];
let usr;
$.ajax({
  url: "/api/countryCodes",
  type: "GET",
}).done(function (data) {
  //populate drop down
  function compare(a, b) {
    if (a.country_name < b.country_name) {
      return -1;
    }
    if (a.country_name > b.country_name) {
      return 1;
    }
    return 0;
  }
  data.sort(compare);

  countryData = data;
  var length = data.length;
  for (var i = 0; i < length; i++) {
    var ops = document.createElement("option");
    ops.setAttribute("value", data[i].phone_code);
    ops.setAttribute("name", data[i].country_name);
    ops.setAttribute("id", data[i].country_name);
    ops.innerHTML = data[i].country_name + " " + data[i].phone_code;
    document.getElementById("countryCode").append(ops);
  }

  loadProfile();
});

// Load the university list.
$.ajax({
  url: "/api/universityList",
  type: "GET",
}).done((universities) => {
  universities.forEach((u) => {
    let opt = document.createElement("option");
    opt.setAttribute("value", u);
    opt.innerHTML = u;
    document.getElementById("university-list").append(opt);
  });
});

function loadProfile() {
  var auth;
  var cookie = document.cookie.split(";");
  const regex = " *auth=.+";
  for (var i = 0; i < cookie.length; i++) {
    if (
      cookie[i].match(regex)
    ) {
      auth = cookie[i];
    }
  }
  $.ajax({
    url: "/users/profile/get",
    headers: {
      authorization: "Bearer " + auth.split("=")[1],
    },
    data: {},
    type: "GET",
    complete: function () {
      console.log("profile loaded");
      console.log();
    },
    error: function () {
      console.log("error in loading user profile");
    },
  }).done(function (data) {
    usr = data;
    console.log(data);
    document.getElementById("fname").value = data.firstName;
    document.getElementById("mname").value = data.middleName;
    document.getElementById("lname").value = data.lastName;
    document.getElementById("titles").value = data.titles;
    document.getElementById("countryCode").options.selectedIndex =
      data.selectedIndex;
    document.getElementById("telephone").value = data.phone;
    document.getElementById("university").value = data.university;
    document.getElementById("department").value = data.department;
    document.getElementById("address1").value = data.streetAddress;
    document.getElementById("address2").value = data.address2;
    document.getElementById("address3").value = data.city;
    document.getElementById("address4").value = data.statesProvinces;
    document.getElementById("postalCode").value = data.postalCode;
    document.getElementById("flexSwitch").checked = data.enableCustomTemplate;
    document.getElementById("switchLabel").innerHTML = data.enableCustomTemplate
      ? "Click to Disable Custom Template"
      : "Click to Enable Custom Template";

    if (data.enableCustomTemplate) {
      document.getElementById("fileUpload").innerHTML =
        '<div><label for="formFile" class="form-label">Recommendation Letter Template</label><input class="form-control" type="file" id="formFile" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onchange="handleFile(this.files)" multiple></div>';
    }
  });
}

//add eventListener to info icons
document.getElementById("general").onclick = function (e) {
  document.getElementById("exampleModalLabel").innerHTML =
    "User Profile Guidance";
  document.getElementById("instructions").innerHTML =
    "User info are needed as part of the letter generation process. Institutions that read the recommendation letter may contact you accroding to the information you provided.";
  document.getElementById("open-modal").click();
};

document.getElementById("title-help").onclick = function (e) {
  document.getElementById("exampleModalLabel").innerHTML = "Title Guidance";
  document.getElementById("instructions").innerHTML =
    "Titles are your university/college job titles. Professor of the Business Department, Dean of the Engineering School, Associate Professor of Finance could be a valid title. " +
    "If you have multiple titles, hit enter after you finish typing one of your titles.";
  document.getElementById("open-modal").click();
};

document.getElementById("address-help").onclick = function (e) {
  document.getElementById("exampleModalLabel").innerHTML = "Address Guidance";
  document.getElementById("instructions").innerHTML =
    "Put down address of your school office if you have one. If not, put down the address of your department";
  document.getElementById("open-modal").click();
};

//add event listener to toggling custom template
function changeLabel() {
  document.getElementById("switchLabel").innerHTML = document.getElementById(
    "flexSwitch"
  ).checked
    ? "Click to Disable Custom Template"
    : "Click to Enable Custom Template";

  document.getElementById("fileUpload").innerHTML = document.getElementById(
    "fileUpload"
  ).innerHTML = document.getElementById("flexSwitch").checked
    ? '<div><label for="formFile" class="form-label">Recommendation Letter Template</label><input class="form-control" type="file" id="formFile" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onchange="handleFile(this.files)" multiple></div>'
    : "";

  if (!document.getElementById("flexSwitch").checked) {
    fileData = [];
    fileName = [];
  }
}

function getCountryCode() {
  $.ajax({
    url: "/api/countryCodes",
    type: "GET",
  }).done(function (data) {
    console.log(data);
  });
}

function updateProfile() {
  var firstName = document.getElementById("fname").value.trim();

  if (firstName.length == 0) {
    alert("Please fill in your firstname");
    return false;
  }
  var middleName = document.getElementById("mname").value.trim();
  var lastName = document.getElementById("lname").value.trim();

  if (lastName.length == 0) {
    alert("Please fill in your lastname");
    return false;
  }
  var university = document.getElementById("university").value.trim();

  if (university.length == 0) {
    alert("Please fill in the university you are working at");
    return false;
  }
  var department = document.getElementById("department").value.trim();

  if (department.length == 0) {
    alert("Please fill in the department you are at");
    return false;
  }

  var titles = document.getElementById("titles").value.trim();

  if (titles.length == 0) {
    alert("Please fill in your job title");
    return false;
  }
  var e1 = document.getElementById("countryCode");
  var index = e1.options.selectedIndex;
  var codes = e1.options[index].value;
  var phone = document.getElementById("telephone").value;

  if (phone.length == 0) {
    alert("Please fill in your phone number");
    return false;
  }
  var country = e1.options[index].getAttribute("name");
  var streetAddress = document.getElementById("address1").value.trim();

  if (streetAddress.length == 0) {
    alert("Please fill in the street address of your on-campus office");
    return false;
  }
  var address2 = document.getElementById("address2").value.trim();

  var city = document.getElementById("address3").value.trim();
  if (city.length == 0) {
    alert("Please fill in the city which your office is at");
    return false;
  }

  var statesProvince = document.getElementById("address4").value.trim();

  if (statesProvince.length == 0) {
    alert("Please fill in the state/provice which your office is at");
    return false;
  }
  var postalCode = document.getElementById("postalCode").value;

  if (postalCode.length == 0) {
    alert("Please fill in the postal/zip code for your office");
    return false;
  }

  if (document.getElementById("flexSwitch").checked) {
    if (
      document.getElementById("formFile").files.length == 0 &&
      !usr.letterTemplates.size
    ) {
      alert("Please upload at least one letter template to you profile.");
      return false;
    }
  }

  var data = {
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    university: university,
    department: department,
    titles: titles,
    codes: codes,
    phone: phone,
    streetAddress: streetAddress,
    address2: address2,
    city: city,
    statesProvinces: statesProvince,
    postalCode: postalCode,
    country: country,
    selectedIndex: index,
    enableCustomTemplate: document.getElementById("flexSwitch").checked,
    fileName: fileName,
    fileData: fileData,
  };

  console.log(data);

  //load jwt token from cookie
  var auth;
  var cookie = document.cookie.split(";");
  const regex = " *auth=.+";
  for (var i = 0; i < cookie.length; i++) {
    if (
      cookie[i].match(regex)
    ) {
      auth = cookie[i];
    }
  }

  //update user profile
  $.ajax({
    url: "/users/profile",
    headers: {
      authorization: "Bearer " + auth.split("=")[1],
    },
    data: {
      raw: JSON.stringify(data),
    },
    type: "POST",
    error: function (err) {
      alert(err.responseJSON.error);
    },
  }).done(function (res) {
    console.log(res);
    console.log(
      "successfully updated user profile for " + firstName + " " + lastName
    );
    window.location.href = "/recommender-dashboard";
  });
}

// Address auto completion features.
let autocomplete;

function initAutocomplete() {
  const address1Field = document.querySelector("#address1");
  // Create the autocomplete object, restricting the search predictions to
  // addresses in the US and Canada.
  autocomplete = new google.maps.places.Autocomplete(address1Field, {
    componentRestrictions: { country: ["us", "ca"] },
    fields: ["address_components", "geometry"],
    types: ["address"],
  });
  address1Field.focus();
  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  const place = autocomplete.getPlace();
  let address1 = "";
  let postalCode = "";

  // Get each component of the address from the place details,
  // and then fill-in the corresponding field on the form.
  // place.address_components are google.maps.GeocoderAddressComponent objects
  // which are documented at http://goo.gle/3l5i5Mr
  for (const component of place.address_components) {
    const componentType = component.types[0];

    switch (componentType) {
      case "street_number": {
        address1 = `${component.long_name} ${address1}`;
        break;
      }

      case "route": {
        address1 += component.short_name;
        break;
      }

      case "postal_code": {
        postalCode = `${component.long_name}${postalCode}`;
        break;
      }

      case "postal_code_suffix": {
        postalCode = `${postalCode}-${component.long_name}`;
        break;
      }
      case "locality":
        document.querySelector("#address3").value = component.long_name;
        break;
      case "administrative_area_level_1": {
        document.querySelector("#address4").value = component.short_name;
        break;
      }
      case "country":
        break;
    }
  }

  const address1Field = document.querySelector("#address1");
  const address2Field = document.querySelector("#address2");
  const postalField = document.querySelector("#postalCode");
  address1Field.value = address1;
  postalField.value = postalCode;
  // After filling the form with address components from the Autocomplete
  // prediction, set cursor focus on the second address line to encourage
  // entry of subpremise information such as apartment, unit, or floor number.
  address2Field.focus();
}

//function for handling file upload
function handleFile(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var fileReader = new FileReader();

    /*
  Read in file in binary, then convert to Uint8Array.
  Next, convert to normal array to deserealize
  In server, we will use this array to write to plain docx
   */
    fileReader.onload = () => {
      fileData.push(Array.from(new Uint8Array(fileReader.result)));
      fileName.push(file.name);
    };

    fileReader.readAsArrayBuffer(file);

    fileReader.onerror = () => {
      console.log(fileReader.error);
    };
  }
}
