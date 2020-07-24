var colors = "red green orange pink white black cyan magenta lightgreen lightcoral".split(
  " "
);
var i = 0;

var $link = $("a");
var $info_box = $(".info-box li");

// $link.css("position", "absolute");
// $("svg").css("position", "relative");

function displayStatsPerCountry(data) {
  let summary = data["Countries"];

  $link.on("click", function (event) {
    let path = $(this).children().first();

    if (event.type == "click") {
      var index = summary.findIndex(function (item) {
        return item.CountryCode == path.attr("id");
      });

      console.log(path.attr("id"));

      let country = summary[index];
      let stats = [
        { Country: [country.Country, country.CountryCode] },
        { "New Confirmed": country.NewConfirmed },
        { "Total Confirmed": country.TotalConfirmed + country.NewConfirmed },
        { "New Deaths": country.NewDeaths },
        { "Total Deaths": country.TotalDeaths + country.NewDeaths },
        { "New Recovered": country.NewRecovered },
        { "Total Recovered": country.TotalRecovered + country.NewRecovered },
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

      console.log(
        `${country.Slug} - New Confirmed: ${
          country.NewConfirmed
        }, Total Confirmed: ${
          country.TotalConfirmed + country.NewConfirmed
        }, New Deaths: ${country.NewDeaths}, Total Deaths: ${
          country.TotalDeaths + country.NewDeaths
        }, New Recovered: ${country.NewRecovered}, Total Recovered: ${
          country.TotalRecovered + country.NewRecovered
        }`
      );
    }
  });
}

var country_summary = [];

// sample
// {
//   "Global": {
//     "NewConfirmed": 100282,
//     "TotalConfirmed": 1162857,
//     "NewDeaths": 5658,
//     "TotalDeaths": 63263,
//     "NewRecovered": 15405,
//     "TotalRecovered": 230845
//   },
//   "Countries": [
//     {
//       "Country": "ALA Aland Islands",
//       "CountryCode": "AX",
//       "Slug": "ala-aland-islands",
//       "NewConfirmed": 0,
//       "TotalConfirmed": 0,
//       "NewDeaths": 0,
//       "TotalDeaths": 0,
//       "NewRecovered": 0,
//       "TotalRecovered": 0,
//       "Date": "2020-04-05T06:37:00Z"
//     }

// function processData(data) {
//   country_summary = data["Countries"];
//   displayStatsPerCountry(country_summary);
//   // $.each(country_summary, function (index, item) {
//   //   displayStatsPerCountry(item);
//   //   // console.log(index + ": " + item["Country"] + " - " + item["TotalDeaths"]);
//   // });
// }

$.ajax({
  url: "https://api.covid19api.com/summary",
  beforeSend: function (xhr) {
    xhr.setRequestHeader(
      "Authorization",
      "Bearer 6QXNMEMFHNY4FJ5ELNFMP5KRW52WFXN5"
    );
  },
  success: (data) => displayStatsPerCountry(data),
});
