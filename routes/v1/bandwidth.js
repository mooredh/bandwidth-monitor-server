const  { Router } = require('express');
const router = Router();
const { getBandwidth, addBandwidth, getBandwidthOverview } = require('../../controllers/bandwidth');

router.post('/', addBandwidth);
router.get('/', getBandwidth);
router.get('/overview', getBandwidthOverview);

module.exports = router;