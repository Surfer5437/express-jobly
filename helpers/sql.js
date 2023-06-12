const { BadRequestError } = require("../expressError");

/** sqlForPartialUpdate accepts 2 parameters
 *  function checks for data contained in the incoming data and converts it to key/value
 * pairs for easy sql integration with proper key names to associate with the database
 * 
 *  - dataToUpdate => req.body example(
 * { name: 'new name', description: 'new description', numEmployees: 1 })
 * 
 * 
 *  - jsToSql => converts to Sql key/value pairs with the following key name exchanges.
 * {"setCols": "\"name\"=$1, \"description\"=$2, \"num_employees\"=$3",
    "values": ["new name","new description",1]
  }
 * 
 * */ 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  )
  ;
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
