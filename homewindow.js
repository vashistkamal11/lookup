const electron = require("electron")
const ipc = electron.ipcRenderer
const mongojs = require("mongojs")
const remote = electron.remote;

$ = require('jquery');
jQuery = require('jquery');

var createlistitem = function(div, Name, status) {
  let chckd = "";
  let color = "";
  if (status == "Off Duty") {
    chckd = "";
    color = "red";
  } else {
    chckd = "checked";
    color = "#d9e4f4";
  }
  let template = `<div style="border-radius:5px; margin-top :5px; margin-down:5px">
    <div  class="row" style="height:50px; background-color :${color};">
      <div class="col-lg-6" style="padding-top:10px;">${Name}</div>
      <div class="col-lg-2 offset-lg-4" style="padding-top:5px;">
        <input type="checkbox" ${chckd} data-toggle="toggle" data-width="100" data-height="40" data-onstyle="default" data-offstyle="primary" data-on="On-Duty" data-off="Off-Duty" data-size="large"></input>
      </div>
    </div>
  </div>`
  let dv = $.parseHTML(template);
  div.appendChild(dv[0]);
  div.addEventListener('click', () => {
    checkboxclick.call(div);
  });
}

var returncheckvalue = function(element) {
  return element.firstChild.firstChild.nextSibling.children[1].children[0].firstChild.checked;
}

var returnnamevalue = function(element) {
  return element.firstChild.children[0].children[0].innerHTML;
}

var checkboxclick = function() {
  let dblist = mongojs('127.0.0.1/list', ['list']);
  let value = returncheckvalue(this);
  let name = returnnamevalue(this);
  for (let i = 0; i < name.length; i++) {
    console.log(name[i]);
  }
  let bgchange = this.firstChild;
  if (value == false) {
    bgchange.firstChild.nextSibling.style['background-color'] = '#d9e4f4';
    dblist.list.update({
      "name": name
    }, {
      $set: {
        "status": "On Duty"
      }
    }, (err, msg) => {
      if (err) {
        alert(err);
        return;
      }
      alert(msg);
    })
  } else {
    bgchange.firstChild.nextSibling.style['background-color'] = 'red';
    dblist.list.update({
      "name": name
    }, {
      $set: {
        "status": "Off Duty"
      }
    }, (err, msg) => {
      if (err) {
        alert(err);
        return;
      }
      alert(msg);
    })
  }
}

var addname = function() {
  let newname = $('#name').val();

  if (newname == "") {
    alert("Please enter a Valid Value");
    return;
  }

  let dblist = mongojs('127.0.0.1/list', ['list']);
  let obj = {
    "name": newname,
    "status": "Off Duty"
  }

  dblist.list.insert(obj, (err, msg) => {
    if (err) {
      alert(err);
      return;
    }
    alert(msg);
  })

  $('#name').val("");
  $('#addnamedialog').modal('hide');
}

var displaynames = function() {
  let dblist = mongojs('127.0.0.1/list', ['list']);
  dblist.list.find({}, (err, records) => {
    if (err) {
      alert(err);
      return;
    }
    for (name in records) {
      let newdiv = document.createElement('div');
      createlistitem(newdiv, records[name].name, records[name].status);
      $('#maindisplay').append(newdiv);
    }
    $("[data-toggle='toggle']").bootstrapToggle('destroy')
    $("[data-toggle='toggle']").bootstrapToggle();
  })
}
window.onload = function() {
  displaynames();
  $("#addname").on('click', () => {
    $('#addnamedialog').modal('show');
    $('#name').focus();
  });

  $('#addnamesave').on('click', addname);
}
