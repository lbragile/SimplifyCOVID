var $link = $("a");
var paths = $("path");
var $info_box = $(".info-box li");

function addText(p) {
  var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
  var b = p.getBBox();
  t.setAttribute(
    "transform",
    "translate(" + (b.x + b.width / 2) + " " + (b.y + b.height / 2) + ")"
  );
  t.textContent = p.getAttribute("data-name");
  t.setAttribute("fill", "lightgreen");
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

  let index;

  $link.on("mouseenter", function () {
    let $path = $(this).children().first();
    index = getIndex(summary, $path.attr("id"));

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
  });

  $link.on("mousemove", function (event) {
    $info_box
      .parents("div")
      .css({ left: event.pageX - 100, top: event.pageY - 210 });
    $info_box.parents("div").show();
  });

  $link.on("mouseleave", () => {
    $info_box.parents("div").hide();
  });

  // add text to the countries
  $.each(paths, (pos, value) => {
    let id = value.getAttribute("id");
    if (id.length == 2) {
      index = getIndex(summary, id);
    }

    if (
      (summary[index].population > 10000000 &&
        summary[index].country != "Chile") ||
      summary[index].country == "Greenland" ||
      summary[index].country == "Mongolia"
    ) {
      addText(paths[pos]);
    }
  });
}

$.ajax({
  type: "GET",
  url: "https://disease.sh/v3/covid-19/countries",
  success: (data) => displayStatsPerCountry(data),
});

// $.ajax({
//   type: "GET",
//   url: "https://data.opendatasoft.com/api/datasets/1.0/search/?rows=195",
//   success: (data) => console.log(data),
// });

// https://corona.lmao.ninja/

// https://api.covid19api.com/summary
