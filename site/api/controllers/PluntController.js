module.exports = {
  getList: function(req, res) {
    res.json(200, PluntService.getList());
  }
}
