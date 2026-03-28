import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Approval = sequelize.define(
  "Approval",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Level persetujuan: 1, 2, dst",
    },
    status: {
      type: DataTypes.ENUM(
        "waiting",
        "pending",
        "approved",
        "rejected",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
  },
);

export default Approval;
