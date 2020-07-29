var $link = $("a");
var $paths = $("path");
var $info_box = $(".info-box li");
var $input = $("#scaling");
var $continents = $(".continents");

function caseHeatMap(summary, type) {
  var country_cases = [];
  $.each(summary, function (index, item) {
    if (type == "cases") {
      country_cases.push(item.todayCases);
    } else if (type == "deaths") {
      country_cases.push(item.todayDeaths);
    } else {
      country_cases.push(item.todayRecovered);
    }
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

function addText(summary) {
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
      "Rwanda",
      "Germany",
      "Greece",
    ];
    var include_countries = [
      "Greenland",
      "Mongolia",
      "Fiji",
      "New Zealand",
      "Papua New Guinea",
      "Uruguay",
      "Paraguay",
      "Libyan Arab Jamahiriya",
      "Namibia",
      "Iceland",
      "Norway",
    ];

    if (
      (summary[index].population > 10000000 &&
        !exclude_countries.includes(summary[index].country)) ||
      include_countries.includes(summary[index].country)
    ) {
      writeText($paths[pos]);
    }
  });
}

function writeText(p) {
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
  t.setAttribute("id", "text-" + p.getAttribute("id"));

  p.parentNode.insertBefore(t, p.nextSibling);
}

function getIndex(summary, id) {
  var index = summary.findIndex(function (item) {
    return item.countryInfo.iso2 == id;
  });

  return index;
}

function statisticHeatMap(summary) {
  $.each($(".options").children("input"), (index, value) => {
    if ($(value).is(":checked")) {
      caseHeatMap(summary, value.id);
    }
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function convertStringToDateTime(x) {
  return new Date(x).toLocaleString("en-US", { timeZone: "America/Vancouver" });
}

function displayGlobalStatistics(summary) {
  var allowed_values = [
    "cases",
    "deaths",
    "recovered",
    "todayCases",
    "todayDeaths",
    "todayRecovered",
    "active",
    "critical",
    "affectedCountries",
    "population",
    "updated",
  ];

  for (let index in allowed_values) {
    if (index < allowed_values.length - 1) {
      html_val = numberWithCommas(summary[allowed_values[index]]);
    } else {
      html_val = convertStringToDateTime(summary[allowed_values[index]]);
    }
    $(".global-info").find("span").eq(index).html(html_val);
  }
}

function displayContinents(summary) {
  var continent_included = [],
    country_names = [];
  $.each($continents.find("input"), (index, value) => {
    if ($(value).is(":checked")) continent_included.push($(value).attr("name"));
  });

  $.each(summary, (index, value) => {
    if (continent_included.includes(value.continent))
      country_names.push(value.countryInfo.iso2);
  });

  $.each($paths, (index, path) => {
    if (country_names.includes(path.id)) {
      $(path).show();
      $(`#text-${path.id}`).show(); // text
    } else {
      $(path).hide();
      $(`#text-${path.id}`).hide(); // text
    }
  });

  var stats = {
    cases: 0,
    deaths: 0,
    recovered: 0,
    todayCases: 0,
    todayDeaths: 0,
    todayRecovered: 0,
    active: 0,
    critical: 0,
    affectedCountries: 0,
    population: 0,
    updated: 0,
  };

  $.each(summary, (index, value) => {
    if (continent_included.includes(value.continent)) {
      $.each(stats, (pos) => {
        stats[pos] += value[pos];
      });
    }
  });

  stats["affectedCountries"] = country_names.length;
  stats["updated"] = $("#update-time span").html();

  displayGlobalStatistics(stats);
}

function displayStatsPerCountry(summary) {
  // remove non-countries from the data
  summary.splice(55, 1); // Diamond Princess
  summary.splice(116, 1); // MS Zaandam

  // add text to the countries
  addText(summary);

  // color countries based on number of cases
  statisticHeatMap(summary);

  // map functionality
  $link.on("mouseenter mousemove mouseleave", function (e) {
    let path = $(this).children().first("path");
    let index = getIndex(summary, path.attr("id"));

    if (index != -1) {
      if (e.type == "mouseenter") {
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
          { Population: country.population },
        ];

        $.each($info_box, (index) => {
          let key = Object.keys(stats[index])[0],
            value = Object.values(stats[index])[0];

          if (index == 0) {
            $info_box.eq(index).html(`${value[0]} (${value[1]})`);
          } else {
            $info_box.eq(index).html(`${key}: ${numberWithCommas(value)}`);
          }
        });
      } else if (e.type == "mousemove") {
        $info_box.parents("div").css({
          left: e.pageX - $info_box.outerWidth() / 2 - 6,
          top: e.pageY - 186,
        });
        $info_box.parents("div").show();
      } else {
        $info_box.parents("div").hide();
        statisticHeatMap(summary);
      }
    } else {
      $(this).hide();
    }
  });

  $(".options")
    .children("input")
    .on("click", () => statisticHeatMap(summary));

  $continents
    .children("input[type='checkbox']")
    .on("change", () => displayContinents(summary));
}

$.ajax({
  type: "GET",
  url: "https://disease.sh/v3/covid-19/all?yesterday=false",
  success: (data) => displayGlobalStatistics(data),
});

$.ajax({
  type: "GET",
  url: "https://disease.sh/v3/covid-19/countries?yesterday=false",
  success: (data) => displayStatsPerCountry(data),
});

const NUM_FRAMES = 2,
  NAV_MAP = {
    0: { dir: 1, act: "zoom", name: "in" },
    107: { dir: 1, act: "zoom", name: "in" }, // numpad
    187: { dir: 1, act: "zoom", name: "in" }, // near backspace

    1: { dir: -1, act: "zoom", name: "out" },
    109: { dir: -1, act: "zoom", name: "out" }, // numpad
    189: { dir: -1, act: "zoom", name: "out" }, // near backspace

    2: { dir: -1, act: "move", name: "up", axis: 1 },
    38: { dir: -1, act: "move", name: "up", axis: 1 },
    3: { dir: -1, act: "move", name: "left", axis: 0 },
    37: { dir: -1, act: "move", name: "left", axis: 0 },
    4: { dir: 1, act: "move", name: "down", axis: 1 },
    40: { dir: 1, act: "move", name: "down", axis: 1 },
    5: { dir: 1, act: "move", name: "right", axis: 0 },
    39: { dir: 1, act: "move", name: "right", axis: 0 },
  },
  SVG = document.querySelector("svg"),
  VIEW_BOX = SVG.getAttribute("viewBox")
    .split(" ")
    .map((c) => parseInt(c)),
  VIEW_MAX_DIM = VIEW_BOX.slice(2),
  VIEW_MIN_DIM = window.innerWidth * 0.2;

let requestID = null,
  frame = 0,
  nav = {},
  target = Array(4);

function update() {
  let k = ++frame / NUM_FRAMES,
    j = 1 - k,
    current_viewbox = VIEW_BOX.slice();

  if (nav.act === "zoom") {
    for (let i = 0; i < 4; i++)
      current_viewbox[i] = j * VIEW_BOX[i] + k * target[i];
  }

  if (nav.act === "move")
    current_viewbox[nav.axis] = j * VIEW_BOX[nav.axis] + k * target[nav.axis];

  SVG.setAttribute("viewBox", current_viewbox.join(" "));

  if (!(frame % NUM_FRAMES)) {
    frame = 0;
    VIEW_BOX.splice(0, 4, ...current_viewbox);
    nav = {};
    target = Array(4);
    cancelAnimationFrame(requestID);
    requestID = null;
    return;
  }

  requestID = requestAnimationFrame(update);
}

$("button").on("mouseover", () => {
  $("button").css("cursor", "pointer");
});

$("button, document").on("click keydown", (e) => {
  e.preventDefault(); // when pressing arrow keys, this prevents the scroll bar from being activated

  if (
    !requestID &&
    (e.which == 1 ||
      (37 <= e.keyCode && e.keyCode <= 40) ||
      e.keyCode == 107 ||
      e.keyCode == 109 ||
      e.keyCode == 187 ||
      e.keyCode == 189)
  ) {
    if (e.which == 1) {
      nav = NAV_MAP[parseInt(e.target.id)];
    } else {
      nav = NAV_MAP[parseInt(e.keyCode)];
    }

    if (nav.act === "zoom") {
      if (
        (nav.dir === -1 && VIEW_BOX[2] >= VIEW_MAX_DIM[0]) ||
        (nav.dir === 1 && VIEW_BOX[2] < VIEW_MIN_DIM)
      ) {
        if (nav.dir === -1 && VIEW_BOX[2] >= VIEW_MAX_DIM[0]) {
          // $(".move").css("visibility", "hidden");
          SVG.setAttribute("viewBox", `80 60 ${VIEW_BOX[2]} ${VIEW_BOX[3]}`);
        }
        return;
      }

      // $(".move").css("visibility", "visible");

      for (let i = 0; i < 2; i++) {
        target[i + 2] = VIEW_BOX[i + 2] / Math.pow(2, nav.dir);
        target[i] = 0.5 * (VIEW_MAX_DIM[i] - target[i + 2]);
      }
    } else if (nav.act === "move") {
      if (
        (nav.dir === -1 && VIEW_BOX[nav.axis] <= 0) ||
        (nav.dir === 1 &&
          VIEW_BOX[nav.axis] >= VIEW_MAX_DIM[nav.axis] - VIEW_BOX[2 + nav.axis])
      ) {
        return;
      }

      target[nav.axis] =
        VIEW_BOX[nav.axis] + 0.5 * nav.dir * VIEW_BOX[2 + nav.axis];
    }

    update();
  }
});

// color bar
colors = [
  "#FF0000",
  "#FF6666",
  "#FF8000",
  "#FFB266",
  "#FFFF00",
  "#FFFF66",
  "#80FF00",
  "#B2FF66",
  "#FFF",
];

text = [
  "≤100% <br><br> >87.5%",
  "≤87.5% <br><br> >75.0%",
  "≤75.0% <br><br> >62.5%",
  "≤62.5% <br><br> >50.0%",
  "≤50.0% <br><br> >37.5%",
  "≤37.5% <br><br> >25.0%",
  "≤25.0% <br><br> >12.5%",
  "≤12.5% <br><br> ≥0.00%",
];

var rect_colors = $("#colorbar").children();
for (var i = 0; i <= colors.length; i++) {
  if (i < colors.length) rect_colors.eq(i).css("background", colors[i]);
  rect_colors.eq(i).html("<p>" + text[i] + "</p>");
}

// to get the colors
rect_colors.on("click", function (e) {
  alert(
    "This color is: " +
      $(this).css("background-color") +
      "\nNote that 100% corresponds to the maximum number reported by a given country and likewise 0% refers to the minimum."
  );
});
