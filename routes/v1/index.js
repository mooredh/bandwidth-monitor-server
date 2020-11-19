const  { Router } = require('express');
const router = Router();

router.use('/bandwidth', require('./bandwidth'));

module.exports = router;