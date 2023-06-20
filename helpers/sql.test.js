const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works for expected values", function () {
    const sqlExchange = sqlForPartialUpdate({ name: 'new name', description: 'new description', numEmployees: 1 },
    { numEmployees: 'num_employees', logoUrl: 'logo_url' });
    
    const expectedOutput = 
    {"setCols": "\"name\"=$1, \"description\"=$2, \"num_employees\"=$3",
    "values": ["new name","new description",1]
  }
    expect(sqlExchange).toEqual(expectedOutput);
  });
});
