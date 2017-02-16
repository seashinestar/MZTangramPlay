import { template } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import Modal from './Modal';
import Icon from '../components/Icon';

// Use mustache-style delimiters
const TEMPLATE_SETTINGS = {
  interpolate: /{{([\s\S]+?)}}/g,
};

// Use template literals for clean multi-line strings, but do not use ES2015's
// ${expression interpolation} syntax -- we replace strings later.
const MAPZENJS_FULL_SNIPPET = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Web Map</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://mapzen.com/js/mapzen.css" />
    <script src="https://mapzen.com/js/mapzen.min.js"></script>
    <style>
      html, body { margin: 0; padding: 0; }
      #map { height: 100%; width: 100%; position: absolute; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.Mapzen.map('map', {
        center: [{{ lat }}, {{ lng }}],
        zoom: {{ zoom }},
        tangramOptions: {
          scene: '{{ scene }}'
        }
      });
    </script>
  </body>
</html>`;

const MAPZENJS_JS_SNIPPET = `var map = L.Mapzen.map('map', {
  center: [{{ lat }}, {{ lng }}],
  zoom: {{ zoom }},
  tangramOptions: {
    scene: '{{ scene }}'
  }
});`;

const SIMPLE_FULL_SNIPPET = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Web Map</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />
    <style>
      html, body { margin: 0; padding: 0; }
      #map { height: 100%; width: 100%; position: absolute; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>
    <script src="https://mapzen.com/tangram/tangram.min.js"></script>
    <script>
      var map = L.map('map');
      var layer = Tangram.leafletLayer({
        scene: '{{ scene }}',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
      });
      layer.addTo(map);
      map.setView([{{ lat }}, {{ lng }}], {{ zoom }});
    </script>
  </body>
</html>`;

const SIMPLE_JS_SNIPPET = `var map = L.map('map');
var layer = Tangram.leafletLayer({
  scene: '{{ scene }}',
  attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors'
});
layer.addTo(map);
map.setView([{{ lat }}, {{ lng }}], {{ zoom }});`;

function getCurrentMapViewFromHash() {
  const hash = window.location.hash.slice(1).split('/');
  return {
    lat: hash[1],
    lng: hash[2],
    zoom: hash[0],
  };
}

class CodeSnippetModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      htmlToggle: 'true',
    };

    this.onClickClose = this.onClickClose.bind(this);
    this.onChangeHtmlToggle = this.onChangeHtmlToggle.bind(this);
  }

  componentDidMount() {
    this.selectTextareaContent();
  }

  componentDidUpdate() {
    this.selectTextareaContent();
  }

  onClickClose() {
    this.props.dispatch({
      type: 'HIDE_MODAL',
      id: this.props.modalId,
    });
  }

  onChangeHtmlToggle(event) {
    this.setState({ htmlToggle: event.target.checked });
  }

  selectTextareaContent() {
    this.textarea.focus();
    this.textarea.select();
    // Prevent scrolling to bottom of textarea after select
    this.textarea.scrollTop = 0;
  }

  render() {
    const url = (this.props.scene && this.props.scene.entrypoint_url) || '[YOUR SCENE FILE HERE]';
    const view = getCurrentMapViewFromHash();
    const snippetMaker = template(MAPZENJS_FULL_SNIPPET, TEMPLATE_SETTINGS);
    const content = snippetMaker({
      scene: url,
      lat: view.lat,
      lng: view.lng,
      zoom: view.zoom,
    });

    return (
      <Modal
        className="modal-alt code-snippet-modal"
        cancelFunction={this.onClickClose}
      >
        <h4>Code snippets</h4>

        <div className="code-snippet-selector">
          <div className="code-snippet-tabs">
            <div className="code-snippet-tab">Mapzen.js</div>
            <div className="code-snippet-tab">Leaflet/Tangram</div>
          </div>
          <div className="code-snippet-tabs-right">
            <input
              type="checkbox"
              id="code-snippet-html-toggle"
              checked={this.state.htmlToggle}
              onChange={this.onChangeHtmlToggle}
            />
            <label htmlFor="code-snippet-html-toggle">Show HTML code</label>
          </div>
        </div>

        <div className="modal-well code-snippet-textarea-container">
          <textarea
            defaultValue={content}
            ref={(ref) => { this.textarea = ref; }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <div className="modal-text">
          <p>
            <a href="https://mapzen.com/documentation/tangram/" target="_blank" rel="noopener noreferrer">Learn more about using Tangram</a>.
          </p>
        </div>

        <div className="modal-buttons">
          <Button onClick={this.onClickClose} className="button-confirm">
            <Icon type="bt-check" /> Done
          </Button>
        </div>
      </Modal>
    );
  }
}

CodeSnippetModal.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  modalId: React.PropTypes.number.isRequired,
  scene: React.PropTypes.shape({
    entrypoint_url: React.PropTypes.string,
  }),
};

CodeSnippetModal.defaultProps = {
  scene: {
    entrypoint_url: '[YOUR SCENE FILE HERE]',
  },
};

function mapStateToProps(state) {
  return {
    scene: state.scene.mapzenSceneData,
  };
}

export default connect(mapStateToProps)(CodeSnippetModal);
