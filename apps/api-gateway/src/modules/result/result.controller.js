import Result from './result.model.js';

// NOTE: GET ETA Result
export const getTrainResult = async (req, res) => {
  try {
    const { trainId } = req.params;

    const result = await Result.findOne({ trainId });

    if (!result) {
      return res
        .status(404)
        .json({ message: 'No result found for this train.' });
    }

    return res.status(200).json({ result });
  } catch (err) {
    console.error('Error Fetching Result By Train: ', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
