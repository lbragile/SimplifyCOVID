var $link = $("a");
var $paths = $("path");
var $info_box = $(".info-box li");
var $input = $("#scaling");

function caseHeatMap(summary) {
  var country_cases = [];
  $.each(summary, function (index, item) {
    country_cases.push(item.todayCases);
  });

  p50_cases =
    country_cases.reduce(function (a, b) {
      return a + b;
    }, 0) / country_cases.length;

  p100_cases = Math.max(...country_cases);
  p0_cases = Math.min(...country_cases);

  p75_cases = (p50_cases + p100_cases) / 2;
  p875_cases = (p75_cases + p100_cases) / 2;
  p625_cases = (p50_cases + p75_cases) / 2;

  p25_cases = (p0_cases + p50_cases) / 2;
  p375_cases = (p50_cases + p25_cases) / 2;
  p125_cases = (p0_cases + p25_cases) / 2;

  $.each($paths, function (_, path) {
    let index = getIndex(summary, path.getAttribute("id"));
    if (country_cases[index] > p875_cases) {
      path.style.fill = "#FF0000";
    } else if (country_cases[index] > p75_cases) {
      path.style.fill = "#FF6666";
    } else if (country_cases[index] > p625_cases) {
      path.style.fill = "#FF8000";
    } else if (country_cases[index] > p50_cases) {
      path.style.fill = "#FFB266";
    } else if (country_cases[index] > p375_cases) {
      path.style.fill = "#FFFF00";
    } else if (country_cases[index] > p25_cases) {
      path.style.fill = "#FFFF66";
    } else if (country_cases[index] > p125_cases) {
      path.style.fill = "#80FF00";
    } else {
      path.style.fill = "#B2FF66";
    }
  });
}

function addText(p) {
  var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  var b = p.getBBox();
  t.setAttribute(
    "transform",
    "translate(" + (b.x + b.width / 2) + " " + (b.y + b.height / 2) + ")"
  );
  t.textContent = p.getAttribute("data-name");
  t.setAttribute("fill", "black");
  t.setAttribute("font-size", "14");
  t.setAttribute("font-weight", "bolder");
  t.setAttribute("user-select", "none");

  p.parentNode.insertBefore(t, p.nextSibling);
}

function getIndex(summary, id) {
  var index = summary.findIndex(function (item) {
    return item.countryInfo.iso2 == id;
  });

  return index;
}

function displayStatsPerCountry(summary) {
  // remove non-countries from the data
  summary.splice(55, 1); // Diamond Princess
  summary.splice(116, 1); // MS Zaandam

  // add text to the countries
  $.each($paths, (pos, value) => {
    let id = value.getAttribute("id");
    if (id.length == 2) {
      index = getIndex(summary, id);
    }

    var exclude_countries = [
      "Chile",
      "Haiti",
      "Mozambique",
      "Cambodia",
      "Malawi",
      "Burundi",
      "Uganda",
      "Benin",
      "Portugal",
      "Côte d'Ivoire",
      "Netherlands",
      "Czechia",
      "Belgium",
    ];
    var include_countries = ["Greenland", "Mongolia"];

    if (
      (summary[index].population > 10000000 &&
        !exclude_countries.includes(summary[index].country)) ||
      include_countries.includes(summary[index].country)
    ) {
      addText($paths[pos]);
    }
  });

  // color countries based on number of cases
  caseHeatMap(summary);

  // map functionality
  $link.on("mouseenter mousemove mouseleave", function (event) {
    let path = $(this).children().first("path");
    let index;

    if (event.type == "mouseenter") {
      index = getIndex(summary, path.attr("id"));
      path.css("fill", "cyan");

      let country = summary[index];
      let stats = [
        { Country: [country.country, country.countryInfo.iso2] },
        { "New Confirmed": country.todayCases },
        { "Total Confirmed": country.cases },
        { "New Deaths": country.todayDeaths },
        { "Total Deaths": country.deaths },
        { "New Recovered": country.todayRecovered },
        { "Total Recovered": country.recovered },
      ];

      $.each($info_box, (index) => {
        let key = Object.keys(stats[index])[0],
          value = Object.values(stats[index])[0];

        if (index == 0) {
          $info_box.eq(index).html(`${value[0]} (${value[1]})`);
        } else {
          $info_box.eq(index).html(`${key}: ${value}`);
        }
      });
    } else if (event.type == "mousemove") {
      $info_box
        .parents("div")
        .css({ left: event.pageX - 100, top: event.pageY - 166 });
      $info_box.parents("div").show();
    } else {
      $info_box.parents("div").hide();
      caseHeatMap(summary);
    }
  });
}

$.ajax({
  type: "GET",
  url: "https://disease.sh/v3/covid-19/countries",
  success: (data) => displayStatsPerCountry(data),
});

// var selection = document.getElementById("select-rectangle"),
//   x1 = 0,
//   y1 = 0,
//   x2 = 0,
//   y2 = 0;
// function reCalc() {
//   //This will restyle the div
//   var x3 = Math.min(x1, x2); //Smaller X
//   var x4 = Math.max(x1, x2); //Larger X
//   var y3 = Math.min(y1, y2); //Smaller Y
//   var y4 = Math.max(y1, y2); //Larger Y
//   selection.style.left = x3 + "px";
//   selection.style.top = y3 + "px";
//   selection.style.width = x4 - x3 + "px";
//   selection.style.height = y4 - y3 + "px";
// }
// onmousedown = function (e) {
//   selection.hidden = 0; //Unhide the div
//   x1 = e.clientX; //Set the initial X
//   y1 = e.clientY; //Set the initial Y
//   reCalc();
// };
// onmousemove = function (e) {
//   x2 = e.clientX; //Update the current position X
//   y2 = e.clientY; //Update the current position Y
//   reCalc();
// };
// onmouseup = function (e) {
//   selection.hidden = 1; //Hide the div
//   pathsInRegion(selection);
// };

const NF = 16,
  NAV_MAP = {
    0: { dir: 1, act: "zoom", name: "in" },
    1: { dir: -1, act: "zoom", name: "out" },
    2: { dir: -1, act: "move", name: "up", axis: 1 },
    3: { dir: 1, act: "move", name: "right", axis: 0 },
    4: { dir: 1, act: "move", name: "down", axis: 1 },
    5: { dir: -1, act: "move", name: "left", axis: 0 },
  },
  _SVG = document.querySelector("svg"),
  VB = _SVG
    .getAttribute("viewBox")
    .split(" ")
    .map((c) => parseInt(c)),
  DMAX = VB.slice(2),
  WMIN = 8;

let rID = null,
  f = 0,
  nav = {},
  tg = Array(4);

function stopAni() {
  cancelAnimationFrame(rID);
  rID = null;
}

function update() {
  let k = ++f / NF,
    j = 1 - k,
    cvb = VB.slice();

  if (nav.act === "zoom") {
    for (let i = 0; i < 4; i++) cvb[i] = j * VB[i] + k * tg[i];
  }

  if (nav.act === "move") cvb[nav.axis] = j * VB[nav.axis] + k * tg[nav.axis];

  _SVG.setAttribute("viewBox", cvb.join(" "));

  if (!(f % NF)) {
    f = 0;
    VB.splice(0, 4, ...cvb);
    nav = {};
    tg = Array(4);
    stopAni();
    return;
  }

  rID = requestAnimationFrame(update);
}

$("button").on("mouseover", (e) => {
  $("button").css("cursor", "pointer");
});

$("button").on("click", (e) => {
  if (!rID && e.which == 1) {
    nav = NAV_MAP[parseInt(e.target.id)];

    if (nav.act === "zoom") {
      if (
        (nav.dir === -1 && VB[2] >= DMAX[0]) ||
        (nav.dir === 1 && VB[2] <= WMIN)
      ) {
        return;
      }

      for (let i = 0; i < 2; i++) {
        tg[i + 2] = VB[i + 2] / Math.pow(2, nav.dir);
        tg[i] = 0.5 * (DMAX[i] - tg[i + 2]);
      }
    } else if (nav.act === "move") {
      if (
        (nav.dir === -1 && VB[nav.axis] <= 0) ||
        (nav.dir === 1 && VB[nav.axis] >= DMAX[nav.axis] - VB[2 + nav.axis])
      ) {
        return;
      }

      tg[nav.axis] = VB[nav.axis] + 0.5 * nav.dir * VB[2 + nav.axis];
    }

    update();
  }
});
