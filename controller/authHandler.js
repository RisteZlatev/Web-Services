const User = require('../database/user/userSchema');
//! npm install jsonwebtoken
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendMail = require('./emailHandler');
const crypto = require('crypto');

exports.signup = async (req, res) => {
  console.log(req.body);
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    await sendMail({
      email: newUser.email,
      subject: "Succesfully added",
      messages: `Thank you for becoming a client in our company`,
    });

    res.status(201).json({
      status: 'Success',
      // token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      err: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    //!1 . Proveruvame dali korisnikot ima vneseno email ili password
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send('Please provide email or password!');
    }

    //!2. Proveruvame dali korisnikot posti
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    //!3. Sporeduvame passvordite
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid email or password');
    }

    //!4. Se generira token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    //!5. Se generira i isprakja cookie
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 10000),
      secure: false,
      httpOnly: true,
    });

    //!6. Se isprkja tokenot
    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      err: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) =>{
  try{
    
    const user = await User.findOne({email: req.body.email});
    if(!user){
      return res.status(404).send("This user doesn't exist");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save({validateBeforeSave: false});
    const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`
    const message = `Ja zaboravivte lozinkata, ve molime iskoristete Patch request so vashata nova lozinka - ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Vashiot resetiracki token (30 minuti validen)",
      messages: message,
    });

    res.status(200).json({
      status: "Success",
      message: "url token send to email",
    })

  }catch(err){
    res.status(500).json({
      status: 'fail',
      err: err.message,
    });
  }
}

exports.resetPassword = async(req, res) => {
  try{

    const hashedToken = crypto.createHash('shah256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now},
    });

  }catch(err){
    res.status(500).json({
      status: 'fail',
      err: err.message,
    });
  }
}