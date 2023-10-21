import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

const prisma = new PrismaClient();
const app = express();
dotenv.config();

app.use(express.json());

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

  const result = await prisma.doctor.create({
    data: {
      name,
      phone,
      password: hashedPassword,
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

  res.json({ ...result, token });
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
    where: {
      patientId: null,
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

app.get(`/trackedHealthData/:id`, verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await prisma.healthDataRecord.findMany({
    where: {
      patientId: id,
      // Return only the records of the last 7 days
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    select: {
      healthData: true,
    },
    distinct: ["healthDataId"],
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
  const { doctorId, patientId } = req.body;

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

export default app;
