var colors = "0f0 0ff f60 f0f 00f f00".split(" ");
var i = 0;

$("a").click(function () {
  $(this)
    .children()
    .first()
    .css("fill", "#" + colors[i++ % colors.length]);
});
