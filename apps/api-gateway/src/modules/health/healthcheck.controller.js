// NOTE: System Health Status
export const healthCheck = async (req, res) => {
  res.status(200).json({ message: '✅ Server is up and running !!' });
};
