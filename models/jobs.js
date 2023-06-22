"use strict";
const { BadRequestError } = require("../expressError");
const db = require("../db");


/** Related functions for jobs. */

class Job {

/** Find all users.
   * Unless filtering is set in the request query for { title, minSalary, hasEquity }
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

static async findAll({title, minSalary, hasEquity} ={}) {
    let query = `SELECT id,
                        title,
                        salary,
                        equity,
                        company_handle
                 FROM jobs`;
    let temp = [];
    let values = [];

    if (title !== undefined) {
      values.push(`%${title}%`);
      temp.push(`title ILIKE $${values.length}`);
    }

    if (minSalary !== undefined) {
      values.push(minSalary);
      temp.push(`salary >= $${values.length}`);
    }

    if (hasEquity === true) {
      temp.push(`equity > 0`);
    }

    if (temp.length > 0) {
      query += " WHERE " + temp.join(" AND ");
    }

    query += " ORDER BY title";
    const jobsRes = await db.query(query, values);
    return jobsRes.rows;
        }


/** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if company already in database.
   * */

static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
          `SELECT title
           FROM jobs
           WHERE title = $1`,
        [title]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title}`);

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "Comapny Handle"`,
        [
            title, salary, equity, company_handle
        ],
    );
    const jobs = result.rows[0];

    return jobs;
  }



/** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/



static async get(title) {
    const companyRes = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = $1`,
        [title]);

    const job = companyRes.rows[0];

    if (!job) throw new NotFoundError(`No company: ${title}`);

    return job;
  }


/** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
}

/** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if Job not found.
   **/

static async remove(title) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`, [title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}
module.exports = Job;
