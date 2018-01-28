$ = require('jquery');
jQuery = require('jquery');

var proto = Object.create(HTMLElement.prototype);
proto.comparefunction = function(first, second) {
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


proto.createlistitem = function(div, Name, status) {
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
  let parser = new DOMParser();
  let dv = parser.parseFromString(template, 'text/html')
  div.appendChild(dv.body.firstChild);
  div.addEventListener('click', () => {
    checkboxclick.call(div)
  });
}

proto.checkboxclick = function() {
  let dblist = mongojs('127.0.0.1/list', ['list']);
  let value = returncheckvalue(this);
  let name = returnnamevalue(this);
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
      alert('sucess');
      location.reload();
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
      alert('sucess');
    })
    location.reload();
  }
}
proto.createdCallback = function() {
  this.shadowRoot = this.createShadowRoot({
    mode: "open"
  });
  let template = `
  <div class = "col-lg-8 col-lg-offset-2">
  <input id = "inputfield" class = " form-control" placeholder = "search here ..."></input>
  <div id ="namelist" class = "col-lg-12" style = "max-height:50%; height:auto; overflow-y:auto;">
  </div>
  <link rel="stylesheet" href="./node_modules/bootstrap/dist/css/bootstrap.min.css">
  <link href="./bootstrap2-toggle.min.css" rel="stylesheet">
  <script>
    $ = jQuery = require('jquery')
  </script>
  <script src="./bootstrap2-toggle.min.js"></script>
  <script src="./node_modules/bootstrap/dist/js/bootstrap.min.js"></script>  </div>
    `
  this.shadowRoot.innerHTML = template;
  this.dataArray = [];

  this.shadowRoot.getElementById('inputfield').addEventListener("keyup", () => {
    this.delayfunction(this.changeDataOnInputChange, 300);
  })

  this.fetchdata = () => {
    let dblist = mongojs('127.0.0.1/list', ['list']);
    dblist.list.find({}, (err, records) => {
      if (err) {
        alert(err);
        return;
      }
      this.dataArray = records.sort(this.comparefunction);
    })
  }
  this.fetchdata();

  this.displaydata = (data) => {
    for (element in data) {
      let namelist = this.shadowRoot.getElementById("namelist");
      let newdiv = document.createElement('div');
      this.createlistitem(newdiv, data[element].name, data[element].status);
      namelist.appendChild(newdiv);
    }
    let nm = this.shadowRoot.getElementById('namelist');
    $(nm).find("[data-toggle='toggle']").bootstrapToggle('destroy');
    $(nm).find("[data-toggle='toggle']").bootstrapToggle();
  }

  this.clickNameListHandler = (e) => {
    e.preventDefault();
    this.displayDetail(e.target);
  }


  this.delayfunction = (function() {
    var timerId = 0;
    return function(callback, timeout) {
      clearTimeout(timerId);
      timerId = setTimeout(callback, timeout);
    };
  })();

  this.changeDataOnInputChange = () => {
    let input = this.shadowRoot.getElementById('inputfield').value;
    this.shadowRoot.getElementById('namelist').innerHTML = "";
    if (input != "") {
      let data = this.dataArray.filter(function(value) {
        return value.name.toUpperCase().startsWith(input.toUpperCase());
      })
      this.displaydata(data);
    }
  }


  this.displayDetail = (element) => {
    let namelist = this.shadowRoot.getElementById('namelist').children;
    for (let i = 0; i < namelist.length; i++) {
      namelist[i].style.backgroundColor = "rgba(39, 43, 48, 0.5)";
    }
    element.style.backgroundColor = "#386002";
    let displaybox = this.shadowRoot.getElementById('details');
    displaybox.innerHTML = "";
    let index = element.getAttribute('index');
    for (info in this.dataArray[index]) {
      let newdiv = document.createElement('h4');
      newdiv.innerHTML = info + " : " + this.dataArray[index][info];
      newdiv.style.padding = " 0px 30px";
      displaybox.appendChild(newdiv);
    }
  }
};

var suggestionBox = document.registerElement('suggestion-Box', {
  prototype: proto
});
