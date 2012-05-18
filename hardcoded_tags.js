function HARDWEBTAGS(){
  this.table = new Object();
  this.table['www.google.com'] = ['search', 'google'];
  this.table['google.com'] = ['search', 'google'];
  this.table['www.yelp.com'] = ['reviews', 'places', 'yelp'];
  this.table['yelp.com'] = ['reviews', 'places', 'yelp'];
  this.table['maps.google.com'] = ['places', 'location', 'maps'];
  this.table['www.amazon.com'] = ['shopping', 'amazon', 'store'];
  this.table['amazon.com'] = ['shopping', 'amazon', 'store'];

  this.lookup = function(domain) {
    return this.table[domain];
  }
}
