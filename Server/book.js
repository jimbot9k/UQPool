const pool = require('./dbPool')

module.exports = {

    //Request a booking NOT IMPLEMENTED
    request(user, result) {
        var json = {};
        pool.getConnection(function(err, con) {
            con.query("SELECT user FROM user;", (err,rows) => {
                if(err) throw err;
                json.msg = "updated";
                result(json);
                con.end((err) => {
                });
            });
        });
    }
    
}
