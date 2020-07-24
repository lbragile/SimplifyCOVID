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

function displayStatsPerCountry(data) {
  let summary = data["Countries"];

  $.each(paths, (index) => {
    addText(paths[index]);
  });

  $link.on("click", function (event) {
    let $path = $(this).children().first();

    if (event.type == "click") {
      var index = summary.findIndex(function (item) {
        return item.CountryCode === $path.attr("id");
      });

      console.log(index);
      console.log(summary[index]);
      let country = summary[index];
      let stats = [
        { Country: [country.Country, country.CountryCode] },
        { "New Confirmed": country.NewConfirmed },
        { "Total Confirmed": country.TotalConfirmed },
        { "New Deaths": country.NewDeaths },
        { "Total Deaths": country.TotalDeaths },
        { "New Recovered": country.NewRecovered },
        { "Total Recovered": country.TotalRecovered },
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

      $info_box
        .parents("div")
        .css({ left: event.pageX - 10, top: event.pageY - 10 });
      $info_box.parents("div").show(1000);
    }
  });

  $info_box.parents("div").on("mouseleave", function () {
    $info_box.parents("div").hide(1000);
  });
}

$.ajax({
  type: "GET",
  url: "https://api.covid19api.com/summary",
  success: (data) => displayStatsPerCountry(data),
});

// $.ajax({
//   type: "GET",
//   url: "https://data.opendatasoft.com/api/datasets/1.0/search/?rows=195",
//   success: (data) => console.log(data),
// });

// https://corona.lmao.ninja/
