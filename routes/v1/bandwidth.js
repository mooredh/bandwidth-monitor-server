const  { Router } = require('express');
const router = Router();
const { getBandwidth, addBandwidth } = require('../../controllers/bandwidth');

router.post('/', addBandwidth);
router.get('/', getBandwidth);

module.exports = router;