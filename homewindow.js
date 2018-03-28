const electron = require("electron")
const ipc = electron.ipcRenderer
const mongojs = require("mongojs")
const remote = electron.remote;
const fs = require('fs');
const path = require('path');
const {
  dialog
} = require('electron').remote;
$ = require('jquery');
jQuery = require('jquery');

var comparefunction = function(first, second) {
  let fname = first.name.toUpperCase();
  let sname = second.name.toUpperCase();
  if (fname == sname) {
    return 0;
  } else if (fname < sname) {
    return -1;
  } else {
    return 1;
  }
}

var createlistitem = function(div, Name, status) {
  let chckd = "";
  let color = "";
  if (status == "Off Duty") {
    chckd = "";
  } else {
    chckd = "checked";
  }
  let template = `<div style="border-radius:5px; margin-top :5px; margin-down:5px">
    <div  class="row" style="height:50px;">
      <div class="col-lg-6" style="padding-top:10px;">${Name}</div>
      <div class="col-lg-2 offset-lg-2" style="padding-top:5px;">
        <input type="checkbox" ${chckd} data-toggle="toggle" data-width="100" data-height="40" data-onstyle="success" data-offstyle="primary" data-on="On-Duty" data-off="Off-Duty" data-size="small"></input>
      </div>
    </div>
  </div>`
  let dv = $.parseHTML(template);
  div.appendChild(dv[0]);
  div.addEventListener('click', (e) => {
    checkboxclick.call(div);
  })
}

var returncheckvalue = function(element) {
  return element.firstChild.firstChild.nextSibling.children[1].children[0].firstChild.checked;
}

var returnnamevalue = function(element) {
  return element.firstChild.children[0].children[0].innerHTML;
}

var checkboxclick = function() {
  let value = returncheckvalue(this);
  let name = returnnamevalue(this);
  let bgchange = this.firstChild;
  if (value == false) {
    dbdetails.details.update({
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
    dbdetails.details.update({
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
  let newname = $('#inputname').val();
  let imgpath = $('#inputimg').val();
  if (newname == "" || imgpath == "") {
    alert("Please enter valid values");
    return;
  }
  removePerson(newname);

  let detailsobject = {
    "name": newname,
    "line1": $('#inputline1').val(),
    "line2": $('#inputline2').val(),
    "line3": $('#inputline3').val(),
    "line4": $('#inputline4').val(),
    "imagename": path.extname($('#inputimg').attr('value'))
  }

  if ($('#inputstatus').is(":checked")) {
    detailsobject.status = "On Duty";
  } else {
    detailsobject.status = "Off Duty";
  }

  let nameobject = {
    "name": newname
  }

  dbdetails.details.insert(detailsobject, (err, msg) => {
    if (err) {
      alert(err);
      removePerson(newname);
      return;
    }
    dbnames.names.insert(nameobject, (err, msg) => {
      if (err) {
        alert(err);
        removePerson(newname);
        return;
      }
      copyImage($('#inputimg').attr('value'), newname + detailsobject.imagename);
      $('#inputname').val("");
      $('#inputline1').val("");
      $('#inputline2').val("");
      $('#inputline3').val("");
      $('#inputline4').val("");
      $('#addnamedialog').modal('hide');
    })
  })

}


var updateFunction = function(namearg) {
  $('#addnamedialog').modal('show');
  $('#inputname').val(namearg);
}

var removeFunction = function(namearg) {
  dialog.showMessageBox(remote.getCurrentWindow(), {
    title: "confirm remove",
    type: "warning",
    buttons: ["NO", "YES"],
    defaultId: 0,
    message: "Are you sure you want to remove " + namearg + " from list ?",
  }, function(response) {
    if (response == 1) {
      removePerson(namearg)
    }
  })
}

var removePerson = function(namearg) {
  dbnames.names.remove({
    name: namearg
  }, (err, msg) => {
    if (err) {
      alert(err);
      return;
    }
    dbdetails.details.find({
      name: namearg
    }, (err, records) => {
      if (err || records[0] == undefined) {
        return;
      }
      let ext = records[0].imagename;
      try {
        fs.unlink('./resources/displayimages/' + namearg + ext);
      } catch (err) {}
      dbdetails.details.remove({
        name: namearg
      }, (err, msg) => {
        if (err) {
          alert(err);
          return;
        }

      })
    })
  })
}

var makelist = function() {
  dbdetails.details.find({}, (err, records) => {
    if (err) {
      alert(err);
      return;
    }
    records.sort(comparefunction);
    for (index in records) {
      let newdiv = document.createElement('div');
      createlistitem(newdiv, records[index].name, records[index].status);
      $('#namelist').append(newdiv);

      let contextmenu = [
        [{
            text: "update",
            action: function() {
              var fname = records[index].name;
              return function() {
                updateFunction(fname);
              }
            }()
          },
          {
            text: "remove",
            action: function() {
              var fname = records[index].name;
              return function() {
                removeFunction(fname);
              }
            }()
          }
        ]
      ]
      $(newdiv).contextMenu(contextmenu);
    }

    $("[data-toggle='toggle']").bootstrapToggle('destroy')
    $("[data-toggle='toggle']").bootstrapToggle();
  })
}


var changeScreen = function() {
  var maindisplay = $('#maindisplay');
  let scrollHeight = maindisplay.prop('scrollHeight');
  let offsetHeight = maindisplay.prop('offsetHeight');
  if (scrollHeight != offsetHeight) {
    let scrolltop = maindisplay.scrollTop();
    if (scrolltop == (scrollHeight - offsetHeight)) {
      maindisplay.scrollTop(1);
    } else {
      scrolltop += (offsetHeight - 20);
      if (scrolltop >= (scrollHeight - offsetHeight)) {
        scrolltop = (scrollHeight - offsetHeight);
      }
      maindisplay.scrollTop(scrolltop);
    }
  }
}

var BrowseButtonFunction = function() {
  dialog.showOpenDialog(remote.getCurrentWindow(), {
    title: "select image"
  }, function(filenames) {
    if (filenames != undefined && filenames.length == 1) {
      $('#inputimg').attr('value', filenames[0]);
    } else if (filenames.length > 1) {
      alert("Please Select a Single file");
    }
  });
}

var copyImage = function(filename, namearg) {
  let source = fs.createReadStream(filename);
  let dest = fs.createWriteStream(path.resolve(__dirname + "/resources/displayimages", namearg));
  source.pipe(dest);
  source.on('err',
    function() {
      alert("Please Try Again");
      removePerson(namearg);
    })
  source.on('finish', function() {
    $('#inputimg').attr("value", "");
  })
}
window.onload = function() {
  $('#test').BootSideMenu({
    side: "right",
    duration: 500,
    autoClose: true,
    width: "30%",
    closeOnClick: true
  });
  try {
    dbnames = mongojs('127.0.0.1/info', ['names']);
    dbdetails = mongojs('127.0.0.1/info', ['details']);
  } catch (err) {
    alert(err.message)
  }
  makelist();
  $("#addnamebutton").on('click', () => {
    $('#addnamedialog').modal('show');
  });
  $('#addnamesave').on('click', addname);
  $('#browsebutton').on('click', BrowseButtonFunction);
  // $('#maindisplay').on('scroll', () => {
  //   window.clearInterval(changeScreenInterval);
  //   changeScreenInterval = window.setInterval(changeScreen, 5000);
  // })
  // changeScreenInterval = window.setInterval(changeScreen, 5000);
}
