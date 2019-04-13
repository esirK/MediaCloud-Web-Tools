import logging

import flask_login
from flask import jsonify, request

from server import app
from server.auth import user_admin_mediacloud_client
from server.util.request import api_error_handler
from server.util.stringutil import ids_from_comma_separated_str
from server.views.topics.topic import topic_summary

logger = logging.getLogger(__name__)


@app.route('/api/topics/<topics_id>/snapshots/update-seed-query', methods=['PUT'])
@flask_login.login_required
@api_error_handler
def topic_update(topics_id):
    # update the seed query first 5 MUST be filled in)
    args = {
        'name': request.form['name'] if 'name' in request.form else None,
        'description': request.form['description'] if 'description' in request.form else None,
        'solr_seed_query': request.form['solr_seed_query'] if 'solr_seed_query' in request.form else None,
        'start_date': request.form['start_date'] if 'start_date' in request.form else None,
        'end_date': request.form['end_date'] if 'end_date' in request.form else None,
        'is_public': request.form['is_public'] if 'is_public' in request.form else None,
        'is_logogram': request.form['is_logogram'] if 'is_logogram' in request.form else None,
        'ch_monitor_id': request.form['ch_monitor_id'] if 'ch_monitor_id' in request.form
                                                          and request.form['ch_monitor_id'] is not None
                                                          and request.form['ch_monitor_id'] != 'null'
                                                          and len(request.form['ch_monitor_id']) > 0 else None,
        'max_iterations': request.form['max_iterations'] if 'max_iterations' in request.form else None,
        'max_stories': request.form['max_stories'] if 'max_stories' in request.form else None,
        'twitter_topics_id': request.form['twitter_topics_id'] if 'twitter_topics_id' in request.form else None
    }
    # parse out any sources and collections to add
    media_ids_to_add = ids_from_comma_separated_str(
        request.form['sources[]'] if 'sources[]' in request.form else '')
    tag_ids_to_add = ids_from_comma_separated_str(request.form['collections[]']
                                                  if 'collections[]' in request.form else '')
    # hack to support twitter-only topics
    if (len(media_ids_to_add) is 0) and (len(tag_ids_to_add) is 0):
        media_ids_to_add = None
        tag_ids_to_add = None
    # update the seed query (the client will start the spider themselves
    user_mc = user_admin_mediacloud_client()
    result = user_mc.topicUpdate(topics_id, media_ids=media_ids_to_add, media_tags_ids=tag_ids_to_add, **args)
    return topic_summary(topics_id)  # give them back new data, so they can update the client


def _next_snapshot_number(topics_id):
    # figure out new snapshot version number
    user_mc = user_admin_mediacloud_client()
    snapshots = user_mc.topicSnapshotList(topics_id)
    return len(snapshots) + 1


@app.route("/api/topics/<topics_id>/snapshots/create", methods=['POST'])
@flask_login.login_required
@api_error_handler
def topic_snapshot_create(topics_id):
    user_mc = user_admin_mediacloud_client()
    # make a new snapshot
    new_snapshot = user_mc.topicCreateSnapshot(topics_id, note=_next_snapshot_number(topics_id))['snapshot']
    return jsonify(new_snapshot)


@app.route("/api/topics/<topics_id>/snapshots/generate", methods=['POST'])
@flask_login.login_required
@api_error_handler
def topic_snapshot_generate(topics_id):
    user_mc = user_admin_mediacloud_client()
    if 'snapshot_id' in request.form:
        # generate into the one passed in
        snapshots_id = request.form['snapshotId'] if 'snapshotId' in request.form else None
    else:
        # make a new snapshot
        new_snapshot = user_mc.topicCreateSnapshot(topics_id, note=_next_snapshot_number(topics_id))['snapshot']
        snapshots_id = new_snapshot['snapshots_id']
    # and now generate into the existing or the new snapshot
    job = user_mc.topicGenerateSnapshot(topics_id, snapshots_id=snapshots_id)
    return jsonify(job)


@app.route("/api/topics/<topics_id>/snapshots/spider", methods=['POST'])
@flask_login.login_required
@api_error_handler
def topic_snapshot_spider(topics_id):
    user_mc = user_admin_mediacloud_client()
    # kick off a spider, which will also generate a snapshot
    if 'snapshotId' in request.form:
        # generate into the one passed in
        snapshots_id = request.form['snapshotId'] if 'snapshotId' in request.form else None
    else:
        # make a new snapshot
        new_snapshot = user_mc.topicCreateSnapshot(topics_id, note=_next_snapshot_number(topics_id))['snapshot']
        snapshots_id = new_snapshot['snapshots_id']
    # and now spider into the existinng or the new snapshot
    job = user_mc.topicSpider(topics_id, snapshots_id=snapshots_id)
    return jsonify(job)