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

function updateBooksUrl(pageNum){
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
  updateBooksUrl(1);
});

$('ul.pagination.books a').on('click',function(){
  const pageNumClicked = $(this).html();
  updateBooksUrl(pageNumClicked);
})

function updatePatronsUrl(pageNum){
  let patron_name = $('#patron_name').val().split(" ").join("%");   // replace all the white spaces with %
  let patron_address = $('#patron_address').val().split(" ").join("%");
  let patron_email = $('#patron_email').val().split(" ").join("%");
  let patron_library_id = $('#patron_library_id').val().split(" ").join("%");
  let patron_zip = $('#patron_zip').val().split(" ").join("%");

  let url = `/patrons?page=${pageNum}`;
  url = url + (patron_name !=="" ? `&name=${patron_name}` : "");
  url = url + (patron_address !=="" ? `&address=${patron_address}` : "");
  url = url + (patron_email !=="" ? `&email=${patron_email}` : "");
  url = url + (patron_library_id !=="" ? `&library_id=${patron_library_id}` : "");
  url = url + (patron_zip !=="" ? `&zip=${patron_zip}` : "");
  window.location.href = url;
}

$('.search_input_patrons').on('change', function(){
  updatePatronsUrl(1);
});

$('ul.pagination.patrons a').on('click',function(){
  const pageNumClicked = $(this).html();
  updatePatronsUrl(pageNumClicked);
})
