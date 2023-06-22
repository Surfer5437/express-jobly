"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const Job = require("../models/jobs");
const { ensureLoggedIn, ensureAdminLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

const jobsNewSchema = require("../schemas/jobsNew.json")


const router = express.Router();



/** GET / => { jobs: [ {title, salary, equity, company_handle }, ... ] }
 *
 * Returns list of all jobs.
 *
 * Authorization required: none
 **/

router.get("/",async function (req,res, next) {
    try{
        const jobs = await Job.findAll(req.query);
       
        return res.status(201).json({ jobs });
    } catch(err){
        return next(err);
    }
});


/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobsNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const jobs = await Job.create(req.body);
      return res.status(201).json({ jobs });
    } catch (err) {
      return next(err);
    }
  });



  
/** GET /[title]  =>  { job }
 *
 *  Job is { title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.handle);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** PATCH /[handle] { field1, field2 } => { Job }
   *
   * Patches job data.
   *
   * fields can be: { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, companyhandle }
   *
   * Authorization required: Admin login
   */
  
  router.patch("/:handle", ensureAdminLoggedIn, async function (req, res, next) {
    try {
      
      const validator = jsonschema.validate(req.body, jobsNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.handle, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });
  
  /** DELETE /[handle]  =>  { deleted: handle }
   *
   * Authorization: Admin login
   */
  
  router.delete("/:handle", ensureAdminLoggedIn, async function (req, res, next) {
    try {
      await Job.remove(req.params.handle);
      return res.json({ deleted: req.params.handle });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;