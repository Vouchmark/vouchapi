require("dotenv").config();
var axios = require("axios").default;
const express = require("express");
const jwt = require("jsonwebtoken");
const { uploadProcessedData, getTheData } = require("./firebase");

const app = express();

const secret__key = process.env.SECRET_KEY;
const port = process.env.PORT;
const key = process.env.VOUCH_KEY;
let token;

function generateToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "5m" });
}
token = generateToken({ userId: "V123p0902" });
setInterval(() => {
  token = generateToken({ userId: "V123p0902" });
}, 300000);

function verifyToken(req, res, next) {
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
}

app.get("/vouchlookup", verifyToken, async (req, res) => {
  const searchId = req.query.search;
  const vkey = req.header("Vouch_key");
  let resultData = [];
  console.log(token);
  if (vkey && vkey === key) {
    var cac_lookup = {
      method: "GET",
      url: "https://api.withmono.com/v3/lookup/cac",
      params: { search: searchId },
      headers: {
        Accept: "*/*",
        Authorization: token,
        "mono-sec-key": secret__key,
      },
    };

    const dbData = await getTheData(searchId);
    console.log(dbData);
    if (dbData != false) {
      console.log("Already Exist");
      resultData.push(dbData);
      res.status(200).send(dbData);
    } else {
      console.log(searchId);
      axios
        .request(cac_lookup)
        .then(async (response) => {
          for (let i = 0; i < response.data.data.length; i++) {
            const modifiedResponse = {
              id: response.data.data[i].id,
              rc_number: response.data.data[i].rc_number,
              approved_name: response.data.data[i].approved_name,
              timestamp: response.data.timestamp,
              company_type_name: response.data.data[i].company_type_name,
              classification_id: response.data.data[i].classification_id,
              business_commencement_date:
                response.data.data[i].business_commencement_date,
              registration_approved:
                response.data.data[i].registration_approved,
              head_office_address: response.data.data[i].head_office_address,
              objectives: response.data.data[i].objectives,
              registration_date: response.data.data[i].registration_date,
              nature_of_business_name:
                response.data.data[i].nature_of_business_name,
              classification: response.data.data[i].classification,
              active: response.data.data[i].active,
              branch_address: response.data.data[i].branch_address,
              lga: response.data.data[i].lga,
              city: response.data.data[i].city,
              email: response.data.data[i].email,
              address: response.data.data[i].address,
              state: response.data.data[i].state,
            };
            console.log(response.data.data[i].id);
            var shareholders = {
              method: "GET",
              url: `https://api.withmono.com/v3/lookup/cac/company/${response.data.data[i].id}`,
              headers: {
                Accept: "*/*",
                "mono-sec-key": secret__key,
              },
            };

            axios
              .request(shareholders)
              .then(async (response) => {
                if (response.message == "Request failed with status code 404") {
                  res
                    .status(404)
                    .send("This company shareholder information is not found!");
                } else {
                  const modifiedResponse2 = {
                    surname: response.data.data[0].surname,
                    firstname: response.data.data[0].firstname,
                    other_name: response.data.data[0].other_name,
                    email: response.data.data[0].email,
                    phone_number: response.data.data[0].phone_number,
                    gender: response.data.data[0].gender,
                    age: response.data.data[0].age,
                    city: response.data.data[0].city,
                    occupation: response.data.data[0].occupation,
                    state: response.data.data[0].state,
                    form_type: response.data.data[0].form_type,
                    identity_number: response.data.data[0].identity_number,
                    num_shares_alloted:
                      response.data.data[0].num_shares_alloted,
                    type_of_shares: response.data.data[0].type_of_shares,
                    date_of_birth: response.data.data[0].date_of_birth,
                    status: response.data.data[0].status,
                    date_of_appointment:
                      response.data.data[0].date_of_appointment,
                    date_of_resolution:
                      response.data.data[0].date_of_resolution,
                    address: response.data.data[0].address,
                    postcode: response.data.data[0].postcode,
                    full_address2: response.data.data[0].full_address2,
                  };

                  const finalResponse = {
                    ...modifiedResponse,
                    shareholders: { ...modifiedResponse2 },
                  };
                  resultData.push(finalResponse);
                  await uploadProcessedData(finalResponse);
                  res.status(200).send(resultData);
                }
              })
              .catch(async (error) => {
                const modifiedResponse2 = {
                  surname: "",
                  firstname: "",
                  other_name: "",
                  email: "",
                  phone_number: "",
                  gender: "",
                  age: "",
                  city: "",
                  occupation: "",
                  state: "",
                  form_type: "",
                  num_shares_alloted: "",
                  type_of_shares: "",
                  date_of_birth: "",
                  status: "",
                  date_of_appointment: "",
                  date_of_resolution: "",
                  address: "",
                  postcode: "",
                  full_address2: "",
                };
                const finalResponse = {
                  ...modifiedResponse,
                  shareholders: { ...modifiedResponse2 },
                };
                resultData.push(finalResponse);

                console.log("Cant find shareholder information");
                await uploadProcessedData(finalResponse);
                res.status(200).send(resultData);
              });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send({ message: error.message });
        });
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.listen(port, () =>
  console.log(`Server started on PORT: http://localhost:${port}`)
);
