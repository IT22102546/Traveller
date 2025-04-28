import User from "../models/user.model.js";

export const test = (req, res) => {
  res.json({
    message: 'API is working'
  });
};


export const updateUser = async (req, res, next) => {
  try {
   
    if (req.body.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{5,}$/;
      if (!passwordRegex.test(req.body.password)) {
        return next(errorHandler(400, 'Password should be at least 5 characters long and contain at least one uppercase letter, one digit, and one symbol (!@#$%^&*()_+).'));
      }
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

   
    if (req.body.username) {
      if (req.body.username.length < 7 || req.body.username.length > 20) {
        return next(errorHandler(400, 'Username must be between 7 and 20 characters'));
      }
    }

   
    if (req.body.mobile) {
      const mobileRegex = /^(071|076|077|075|078|070|074|072)\d{7}$/;
      if (!mobileRegex.test(req.body.mobile)) {
        return next(errorHandler(400, 'Invalid mobile number format. Should be a Sri Lankan number starting with 071, 076, 077, 075, 078, 070, 074, or 072 followed by 7 digits.'));
      }
    }

   
    const updateFields = {
      ...(req.body.username && { username: req.body.username }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.password && { password: req.body.password }),
      ...(req.body.adress && { adress: req.body.adress }),
      ...(req.body.mobile && { mobile: req.body.mobile }),
      ...(req.body.profilePicture && { profilePicture: req.body.profilePicture })
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};


export const signout = (req, res, next) => {
  try {
    res.clearCookie('acess_token').status(200).json('User has been signed out');
  } catch (error) {
    next(error);
  }
};






