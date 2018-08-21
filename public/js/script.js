// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function updateUrl(pageNum){
  let filter = getUrlParameter("filter");
  let title = $('#title').val().split(" ").join("%");   // replace all the white spaces with %
  let author = $('#author').val().split(" ").join("%");
  let genre = $('#genre').val().split(" ").join("%");
  let year = $('#year').val().split(" ").join("%");

  let url = `/books?page=${pageNum}`;
  url = url + (filter ? `&filter=${filter}` : "");
  url = url + (title !=="" ? `&title=${title}` : "");
  url = url + (author !=="" ? `&author=${author}` : "");
  url = url + (genre !=="" ? `&genre=${genre}` : "");
  url = url + (year !=="" ? `&year=${year}` : "");
  window.location.href = url;
}

$('.search_input_books').on('change', function(){
  updateUrl(1);
});

$('ul.pagination a').on('click',function(){
  const pageNumClicked = $(this).html();
  updateUrl(pageNumClicked);
})
