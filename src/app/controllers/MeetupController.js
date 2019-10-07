import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  /*
   * Get, list
   */
  async index(req, res) {
    const where = {};
    const page = req.query.page || 1;
    const requestedDay = req.query.date;

    if (requestedDay) {
      const searchDate = parseISO(requestedDay);
      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      attributes: ['id', 'past', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetups);
  }

  /*
   * Post, create
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    const isExistMeetup = await Meetup.findOne({
      where: { title: req.body.title },
    });

    const isBeforeDate = isBefore(parseISO(req.body.date), new Date());

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (isBeforeDate) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    if (isExistMeetup) {
      return res
        .status(400)
        .json({ error: 'There is already a Meetup with this title' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  /*
   * Update
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user_id = req.userId;
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'This meetup has passed and cannot be changed.' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  /*
   * Delete
   */
  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'This meetup has passed and cannot be deleted' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
