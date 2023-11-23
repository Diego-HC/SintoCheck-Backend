// TODO: checar que al hacer el request solo pueda editar el usuario sus propias cosas.

import { PrismaClient } from "@prisma/client";
import express from "express";
// import bcrypt from "bcryptjs";
var bcrypt = require("bcryptjs");
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
const prisma = new PrismaClient();
const app = express();
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary, 
    //@ts-ignore
    padams : {
      folder: 'SintoCheck',
      allowedFormats: ['jpeg', 'png', 'jpg']
    }
    
})
const upload = multer({storage});



app.use(express.json());


function generateCode() {
  const charset = "abcdefghijklmnopqrstuvwxyz1234567890";
  let retVal = "";
  for (let i = 0, n = charset.length; i < 6; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n)).toUpperCase();
  }
  return retVal;
}



// --- Authentication ---
function verifyToken(req: any, res: any, next: any) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  jsonwebtoken.verify(
    token,
    process.env.JWT_SECRET ?? "ola",
    (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      req.user = decoded;
      next();
    }
  );
}


app.post("/image/patient", verifyToken, upload.single('image'), async (req, res) => {
  const {patientId} = req.body;
  const {path, filename}: any = req.file;

  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId
    }
  })
  if (patient !== null) {
    if (patient.imageFilename !== null) {
      //eliminar imagen de cloudinary
      cloudinary.uploader.destroy(patient.imageFilename)
    }
    const patientImage = await prisma.patient.update({
      where: {
        id: patientId
      },
      data : {
        imageurl: path,
        imageFilename: filename
      }
    });

    res.json(patientImage)
  }
  
})

app.get('/image/patient/:id', verifyToken, async (req, res) => {
  const {id} = req.params
  //obtener el patient de prisma
  const patientImage = await prisma.patient.findFirst({
    where: {
      id: id,
    },
  });
  if (patientImage !== null && patientImage.imageurl !== null) {
    const data = {
      url: patientImage.imageurl
    }
    res.json(data)
    
  } else {
    res.json()
  }

})

// --- Account Management ---
app.post(`/signup/patient`, async (req, res) => {
  const {
    name,
    phone,
    password,
    birthdate,
    height,
    weight,
    medicine,
    medicalBackground,
  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.patient.create({
    data: {
      name,
      phone,
      password: hashedPassword,
      birthdate,
      height,
      weight,
      medicine,
      medicalBackground,
    },
  });

  res.json(result);
});

app.post(`/signup/doctor`, async (req, res) => {
  const { name, phone, password, speciality, address } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  let foundDoctor = true;
  
  
  let cont = 0;
  let code = "";
  while (foundDoctor && cont < 5) {
    code = generateCode();
    const doctor = await prisma.doctor.findFirst({
      where: {
        code: code,
      },
    });
    if (doctor === null) {
      foundDoctor = false;
    }
    cont++;
  }
  const result = await prisma.doctor.create({
    data: {
      name,
      phone,
      password: hashedPassword,
      code,
      speciality,
      address,
    },
  });

  res.json(result);
});


app.post(`/login/patient`, async (req, res) => {
  const { phone, password } = req.body;

  const result = await prisma.patient.findFirst({
    where: {
      phone,
    },
  });
  
  let {imageurl, imageFilename, ...restOfPatient}: any = result

  if (!result) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const passwordMatch = await bcrypt.compare(password, result.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const token = jsonwebtoken.sign(
    {
      id: result.id,
      name: result.name,
      phone: result.phone,
    },
    process.env.JWT_SECRET ?? "ola",
    { expiresIn: "14d" }
  );
  
  res.json({ ...restOfPatient, token });
});

app.post(`/login/doctor`, async (req, res) => {
  const { phone, password } = req.body;

  const result = await prisma.doctor.findFirst({
    where: {
      phone,
    },
  });

  if (!result) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const passwordMatch = await bcrypt.compare(password, result.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const token = jsonwebtoken.sign(
    {
      id: result.id,
      name: result.name,
      phone: result.phone,
    },
    process.env.JWT_SECRET ?? "ola",
    { expiresIn: "1h" }
  );

  res.json({ ...result, token });
});

app.delete(`/patient/:id`, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.patient.delete({
    where: {
      id: id,
    },
  });
  

  res.json(result);
});

app.delete(`/doctor/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.doctor.delete({
    where: {
      id: id,
    },
  });

  res.json(result);
});

app.put(`/patient/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    birthdate,
    height,
    weight,
    medicine,
    medicalBackground,
  } = req.body;

  const result = await prisma.patient.update({
    where: {
      id: id,
    },
    data: {
      name,
      phone,
      birthdate,
      height,
      weight,
      medicine,
      medicalBackground,
    },
  });

  res.json(result);
});

app.put(`/patientPassword/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.patient.update({
    where: {
      id: id,
    },
    data: {
      password: hashedPassword,
    },
  });

  res.json(result);
});

app.put(`/doctor/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, speciality, address } = req.body;

  const result = await prisma.doctor.update({
    where: {
      id: id,
    },
    data: {
      name,
      phone,
      speciality,
      address,
    },
  });

  res.json(result);
});

// --- Health Data Lists ---
app.get(`/healthData`, verifyToken, async (req, res) => {
  const result = await prisma.healthData.findMany({
    include: {
      patient: true
    },
    where: {
      patient: null,
    },
  });

  res.status(200).json(result);
  // res.json(result);
});

app.get(`/personalizedHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthData.findMany({
    where: {
      patientId: id,
    },
  });

  res.status(200).json(result);
});

app.put(`/untrackHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthData.update({
    where: {
      id: id,
    },
    data: {
      tracked: false,
    },
  });

  res.json(result);
});

app.put(`/untrackHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthData.update({
    where: {
      id: id,
    },
    data: {
      tracked: false,
    },
  });

  res.json(result);
});

app.get(`/trackedHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthData.findMany({
    where: {
      patientId: id,
      tracked: true,
    },
  });

  res.json(result);
});

app.post(`/personalizedHealthData`, verifyToken, async (req, res) => {
  const { name, quantitative, patientId, rangeMin, rangeMax, unit } = req.body;

  const result = await prisma.healthData.create({
    data: {
      name,
      quantitative,
      patientId,
      rangeMin,
      rangeMax,
      unit,
    },
  });

  res.status(201).json(result);
});

app.put(`/personalizedHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, quantitative, rangeMin, rangeMax, unit } = req.body;

  const result = await prisma.healthData.update({
    where: {
      id: id,
    },
    data: {
      name,
      quantitative,
      rangeMin,
      rangeMax,
      unit,
    },
  });

  res.json(result);
});

app.delete(`/personalizedHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthData.delete({
    where: {
      id: id,
      patientId: {
        not: null,
      },
    },
  });

  res.json(result);
});

// --- Health Data Records ---

app.get(
  `/healthDataRecords/:patientId/:healthDataId`,
  verifyToken,
  async (req, res) => {
    const { patientId, healthDataId } = req.params;

    const result = await prisma.healthDataRecord.findMany({
      where: {
        patientId: patientId,
        healthDataId: healthDataId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(result);
  }
);

app.post(`/healthDataRecord`, verifyToken, async (req, res) => {
  const { patientId, healthDataId, value, note } = req.body;

  const result = await prisma.healthDataRecord.create({
    data: {
      patientId,
      healthDataId,
      value,
      note,
    },
  });

  res.json(result);
});

app.put(`/healthDataRecord/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;
  const { value, note } = req.body;

  const result = await prisma.healthDataRecord.update({
    where: {
      id: id,
    },
    data: {
      value,
      note,
    },
  });

  res.json(result);
});

app.delete(`/healthDataRecord/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthDataRecord.delete({
    where: {
      id: id,
    },
  });

  res.json(result);
});

// --- Notes ---

app.get(`/notes/:patientId`, verifyToken, async (req, res) => {
  const { patientId } = req.params;

  const result = await prisma.note.findMany({
    where: {
      patientId: patientId,
    },
  });

  res.json(result);
});

app.post(`/note`, verifyToken, async (req, res) => {
  const { title, content, patientId } = req.body;

  const result = await prisma.note.create({
    data: {
      title,
      content,
      patientId,
    },
  });

  res.json(result);
});

app.put(`/note/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const result = await prisma.note.update({
    where: {
      id: id,
    },
    data: {
      title,
      content,
    },
  });

  res.json(result);
});

app.delete(`/note/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.note.delete({
    where: {
      id: id,
    },
  });

  res.json(result);
});

// --- Doctor Patient Relationship ---

app.get(
  `/doctorPatientRelationship/:patientId`,
  verifyToken,
  async (req, res) => {
    const { patientId } = req.params;

    const result = await prisma.doctor.findMany({
      where: {
        patients: {
          some: {
            id: patientId,
          },
        },
      },
    });

    res.json(result);
  }
);

app.post(`/doctorPatientRelationship`, verifyToken, async (req, res) => {
  const { doctorCode, patientId } = req.body;
  const doctor = await prisma.doctor.findFirst({
    where: {
      code: doctorCode,
    },
  });
  let doctorId = "";
  if (doctor !== null) {
    doctorId = doctor.id;
  }
  const result = await prisma.doctor.update({
    where: {
      id: doctorId,
    },
    data: {
      patients: {
        connect: {
          id: patientId,
        },
      },
    },
  });

  res.json(result);
});

app.delete(`/doctorPatientRelationship`, verifyToken, async (req, res) => {
  const { doctorId, patientId } = req.body;

  const result = await prisma.doctor.update({
    where: {
      id: doctorId,
    },
    data: {
      patients: {
        disconnect: {
          id: patientId,
        },
      },
    },
  });

  res.json(result);
});
app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});
export default app;
