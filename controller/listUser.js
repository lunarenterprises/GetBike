var model = require('../model/listUser');

module.exports.listUser = async (req, res) => {
    try {
        let { user_id } = req.body || {}
        var condition = ''

        if (user_id) {
            condition = `and u_id ='${user_id}'`
        }
        let listUser = await model.listUserQuery(condition);
        if (listUser.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                list: listUser
            });

        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}
module.exports.deleteUser = async (req, res) => {
    try {
        let { user_id } = req.body || {};

        if (!user_id) {
            return res.send({
                result: false,
                message: "user_id is required"
            });
        }

        let result = await model.deleteUserQuery(user_id);

        if (result.affectedRows > 0) {
            return res.send({
                result: true,
                message: "User deleted successfully"
            });
        } else {
            return res.send({
                result: false,
                message: "User not found"
            });
        }
    } catch (error) {
        return res.send({
            result: false,
            message: error.message,
        });
    }
};


module.exports.listAdmincontact = async (req, res) => {
    try {

        let listAdminContact = await model.listAdminContactQuery();
        if (listAdminContact.length > 0) {
            return res.send({
                result: true,
                message: "data retrived",
                list: listAdminContact
            });

        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}