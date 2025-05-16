const express = require('express');
const passport = require('passport');
const PorfileService = require('../service/profileService');
const router = express.Router();
const service = new PorfileService();

router.get(
  '/porfile-user/:token',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { token } = req.params;
      const rta = await service.getData(token);
      res.status(200).json(rta);
    } catch (error) {
      res.status(400).json({ message: 'Error' });
    }
  }
);

router.get(
  '/data-team/:token',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { token } = req.params;
      const rta = await service.getDataTeam(token);
      res.status(200).json(rta);
    } catch (error) {
      res.status(400).json({ message: 'Error' });
    }
  }
);

module.exports = router;
