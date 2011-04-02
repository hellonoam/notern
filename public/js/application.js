var notern = null;

$(document).ready(function() {
  notern = new Notern();
  $("html").addClass( "image" + (Math.floor(Math.random()*4)+1) );
});
