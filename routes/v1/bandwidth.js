const  { Router } = require('express');
const router = Router();
const { addBandwidth, getBandwidthOverview, getBandwidthByMonth } = require('../../controllers/bandwidth');

router.post('/', addBandwidth);
router.get('/', getBandwidthByMonth);
router.get('/overview', getBandwidthOverview);

module.exports = router;