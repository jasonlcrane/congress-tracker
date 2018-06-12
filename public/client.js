// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

// TODO - convert to Vue.js? React? Maybe make it a Nativescript app?
// TODO - do some refactoring

$(function() {
 
  /* Set the terms you want to query the ProPublica API for here.
    Note that multiple words should be quoted per ProPublica API docs */
  var queryTermStatements = 'guns';
  var queryTermBills = '"gun violence"';
  
  var searchStatements = function(q) {
    $.ajax({
         url: "/statements?q=" + q,
         type: "GET",
         success: function(data) {
           var items = data.body.results;
           var statements = [];
           var statement = {};
           items.forEach(function(item) {
             statement = {
              title: decode(item.title.replace(/\\"/g, '"')),
              author: item.name,
               date: new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}),
               chamber: item.chamber,
               party: item.party,
               state: item.state,
               url: item.url,
               member_id: item.member_id,
               stateclass: item.state.toLowerCase()
             }
             statements.push(statement);
             
          });
          var data = {  statements: statements };
          loadData(data, 'statements');
         }
    });
  }
  
  var searchBills = function(q) {
    $.ajax({
         url: "/bills?q=" + q,
         type: "GET",
         success: function(data) {
           var bills = [];
           var bill = {};
           var items = data.body.results[0].bills;
           items.forEach(function(item) {
             bill = {
              title: decode(item.title.replace(/\\"/g, '"')),
               sponsor: item.sponsor_title + ' ' + item.sponsor_name,
               sponsor_id: item.sponsor_id,
               party: item.sponsor_party,
               state: item.sponsor_state,
               url: item.govtrack_url,
               introduced_date: new Date(item.introduced_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}),
               latest_major_action: item.latest_major_action,
               latest_major_action_date: new Date(item.latest_major_action_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})
             }
             bills.push(bill);
          })
           var data = {  bills: bills };
          loadData(data, 'bills');
         }
    });
  }
  
  // when a user clicks a rep's name get their info
  var getAuthorInfo = function() {
    $('body').on('click', '.author-info', function(e) {
      e.preventDefault();
      var url = '/members?id=' + $(e.target).data('memberid');
      $.ajax({
         url: url,
         type: "GET",
         success: function(data) {
           var item = data.body.results[0];
           var rep = {
             name: item.first_name + ' ' + item.last_name,
             url: item.url,
             twitter: item.twitter_account,
             facebook: item.facebook_account,
             phone: item.roles[0].phone
           }
           
          loadData(rep, 'rep-modal');
           MicroModal.show('rep-modal');
           trackAnalyticsEvent({
              category: 'Info',
              action: 'contact_info',
              label: item.first_name + ' ' + item.last_name,
              value: 0
            });           
        }
      });
    });
  }
  
  // TODO -> do this without jquery dom traversal
  var tabSwitcher = function() {
   $('.tab-label a').on('click', function(e) {
     e.preventDefault();
     var $this = $(this);
     $this.addClass('active');
     $this.parents('li').siblings().children('a').removeClass('active');
     
     var href=$(this).attr('href');
     $('.tab-content').removeClass('active');
     $(href).addClass('active');
     
     trackAnalyticsEvent({
      category: 'Info',
      action: 'tab_switch',
      label: $this.text(),
      value: 0
    });  
   });
  }
  
  // load data in a mustache template (in index.html)
  var loadData = function(data, tpl) {
    var template = $('#' + tpl + '-tpl').html();
    // Mustache.parse(template);   // optional, speeds up future uses
    var rendered = Mustache.render(template, data);
    $('#' + tpl).html(rendered);
  }
  
  // helper function to decode &amp; in some titles
  // maybe a better way to do this?
  var decode = function(str) {
    var parser = new DOMParser;
    var dom = parser.parseFromString(
    '<!doctype html><body>' + str,
    'text/html');
    return dom.body.textContent;
}
  
  // helper function to track events
  var trackAnalyticsEvent = function(event) {

    // set defaults
    var category = event.category || 'Site';
    var action = event.action || 'General action';
    var label = event.label || '';

    gtag('event', action, {
      'event_category': category,
      'event_label': label

    });
  }
  
  // init function that need to be run on load
  
  // search statements and bills, pass in a query term
  searchStatements(queryTermStatements);
  searchBills(queryTermBills);
  getAuthorInfo();
  
  // modal window init 
  MicroModal.init();
  
  // handle tab switching
  tabSwitcher();

})