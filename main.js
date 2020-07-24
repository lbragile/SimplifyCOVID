var colors = "red green orange pink white black cyan magenta lightgreen lightcoral".split(
  " "
);
var i = 0;

function displayStatsPerCountry(data) {
  let summary = data["Countries"];

  $("a").on("click mouseenter mouseleave", function (event) {
    let path = $(this).children().first();

    if (event.type == "click") {
      var index = summary.findIndex(function (item) {
        return item.CountryCode == path.attr("id");
      });

      console.log(path.attr("id"));

      let country = summary[index];
      console.log(
        `${country.Slug} - New Confirmed: ${country.NewConfirmed}, Total Confirmed: ${country.TotalConfirmed}, New Deaths: ${country.NewDeaths}, Total Deaths: ${country.TotalDeaths}, New Recovered: ${country.NewRecovered}, Total Recovered: ${country.TotalRecovered}`
      );
    } else if (event.type == "mouseenter") {
      path.css("fill", "yellow");
    } else {
      path.css("fill", "blue");
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
