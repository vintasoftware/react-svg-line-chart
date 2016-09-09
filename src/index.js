import './index.css'

import React, { PropTypes } from 'react'
import classNames from 'classnames'

const { arrayOf, bool, func, number, shape } = PropTypes;

export default class LineChart extends React.Component {

  constructor(props) {
    super(props);
  }

  /**
   * Chart coordinates
   */

  getMinX() {
    const { data1, data2 } = this.props;
    const minData1 = data1.length > 0 ? data1[0].x : 0;
    const minData2 = data2.length > 0 ? data2[0].x : 0;
    return Math.min(minData1, minData2);
  }

  getMaxX() {
    const { data1, data2 } = this.props;
    const maxData1 = data1.length > 0 ? data1[data1.length - 1].x : 0;
    const maxData2 = data2.length > 0 ? data2[data2.length - 1].x : 0;
    return Math.max(maxData1, maxData2);
  }

  getMinY() {
    return 0
  }

  getMaxY() {
    const { data1, data2, yLabelsNb } = this.props;
    const maxData1 = data1.length > 0 ? data1.reduce((max, point) => point.y > max ? point.y : max, data1[0].y) : 0;
    const maxData2 = data2.length > 0 ? data2.reduce((max, point) => point.y > max ? point.y : max, data2[0].y) : 0;
    const maxY = Math.max(maxData1, maxData2);
    return Math.ceil(maxY / yLabelsNb) * yLabelsNb
  }

  /**
   * Svg coordinates
   */

  getSvgX(x) {
    const { nolabel, viewBoxWidth, yLabelsWidth } = this.props;
    const maxX = this.getMaxX();
    const margin = (!nolabel ? yLabelsWidth * 2 : 0);
    return (x / maxX * (viewBoxWidth - margin))
  }

  getSvgY(y) {
    const { nolabel, viewBoxHeight } = this.props;
    const heightWithoutLabels = viewBoxHeight - (!nolabel ? 20 : 0);
    const maxY = this.getMaxY();
    return heightWithoutLabels - (y / maxY * heightWithoutLabels)
  }

  /**
   * Svg components
   */

  getGrid() {
    const { data1, yLabelsNb, nogridX, nogridY } = this.props;
    const minX = 0;
    const maxX = this.getMaxX();
    const minY = 0;
    const gridX = [];
    const gridY = [];
    const maxY = this.getMaxY();

    for (let i = 0; i < data1.length; i++) {
       gridX.push(
         <line
           key={ 'linechart_grid_x_' + i }
           x1={ Number(this.getSvgX(data1[i].x)) }
           y1={ this.getSvgY(minY) }
           x2={ this.getSvgX(data1[i].x) }
           y2={ Number(this.getSvgY(maxY)) }
         />
       )
     }

    for (let i = minY; i <= maxY; i += Math.floor(maxY / yLabelsNb)) {
      gridY.push(
        <line
          key={ 'linechart_grid_y_' + i }
          x1={ this.getSvgX(minX) }
          y1={ this.getSvgY(i) }
          x2={ this.getSvgX(maxX) }
          y2={ this.getSvgY(i) }
        />
      )
    }

    return (
      <g className="linechart_grid">
        { nogridX ? [] : gridX }
        { nogridY ? [] : gridY }
      </g>
    )
  }

  getPath() {
    const { data1, data2 } = this.props;
    const datas = [data1, data2];
    let paths = [];

    for (let i = 0; i < datas.length; i += 1) {
      let pathD = 'M ' + this.getSvgX(datas[i][0].x) + ' ' + this.getSvgY(datas[i][0].y) + ' ';

      datas[i].map((point, i) => {
        pathD += 'L ' + this.getSvgX(point.x) + ' ' + this.getSvgY(point.y) + ' '
      });

      paths.push(pathD);
      pathD = '';

    }

    return (
      <g>
        { paths.map((path) =>
          <path className="linechart_path" d={ path }/>
        )}
      </g>
    )
  }

  getArea() {
    const { data1 } = this.props;
    let pathD = 'M ' + this.getSvgX(data1[0].x) + ' ' + this.getSvgY(data1[0].y) + ' ';

    data1.map((point, i) => {
      pathD += 'L ' + this.getSvgX(point.x) + ' ' + this.getSvgY(point.y) + ' '
    });

    pathD += 'L ' + this.getSvgX(data1[data1.length - 1].x) + ' ' + this.getSvgY(0) + ' ';
    pathD += 'L ' + this.getSvgX(data1[0].x) + ' ' + this.getSvgY(0) + ' ';

    return (
      <path className="linechart_area" d={ pathD } />
    )
  }

  getLabels() {
    const { data1, formatX, formatY, yLabelsNb } = this.props;
    const minX = this.getMinX();
    const maxY = this.getMaxY();
    const yLabelsRange = [];

    for (let i = 0; i <= maxY; i += Math.floor(maxY / yLabelsNb)) {
      yLabelsRange.push(i)
    }

    const xLabels = data1.filter((point) => (point.x & 1)).map((point) => (
      <g
        key={ 'linechart_label_x_' + point.x }
        className="linechart_label"
        transform={`translate(${ this.getSvgX(point.x) },${ this.getSvgY(0) })`}
      >
        <circle r="2" cx="0" cy="0" />
        <text transform="translate(0, 20)" textAnchor="middle">
          { formatX ? formatX(point.x) : point.x }
        </text>
      </g>
    ));

    const yLabels = yLabelsRange.map((y) => (
      <g
        key={ 'linechart_label_y_' + y }
        className="linechart_label"
        transform={`translate(${ this.getSvgX(minX) },${ this.getSvgY(y) })`}
      >
        <circle r="2" cx="0" cy="0" />
        <text transform="translate(-10, 5)" textAnchor="end">
          { formatY ? formatY(y) : y }
        </text>
      </g>
    ));

    return (
      <g className="linechart_labels">
        <g className="linechart_xLabels">{ xLabels }</g>
        <g className="linechart_yLabels">{ yLabels }</g>
      </g>
    )
  }

  getAxis() {
    const { noaxiX, noaxiYl, noaxiYr } = this.props;
    const minX = this.getMinX();
    const maxX = this.getMaxX();
    const minY = this.getMinY();
    const maxY = this.getMaxY();

    return (
      <g className="linechart_axis">
        { noaxiX ? <line /> :
          <line
            x1={ this.getSvgX(0) }
            y1={ this.getSvgY(minY) }
            x2={ this.getSvgX(maxX) }
            y2={ this.getSvgY(minY) }
            />
        }
        { noaxiYl ? <line /> :
          <line
            x1={ this.getSvgX(0) }
            y1={ this.getSvgY(minY) }
            x2={ this.getSvgX(0) }
            y2={ this.getSvgY(maxY) }
            />
        }
        { noaxiYr ? <line /> :
          <line
            x1={ this.getSvgX(maxX) }
            y1={ this.getSvgY(minY) }
            x2={ this.getSvgX(maxX) }
            y2={ this.getSvgY(maxY) }
            />
        }
      </g>
    )
  }

  getPoints() {
    const { activePoint, data1, hoveredPointRadius, pointRadius, data2 } = this.props;

    const datas = [data1, data2];
    return (
      <g className="linechart_points">
      { datas.map((data) =>
        data.map((point, i) => {
          return (
            <circle
              key={ 'linechart_point_' + i }
              className="linechart_point"
              r={ activePoint && activePoint.x === point.x && activePoint.y === point.y ? hoveredPointRadius : pointRadius }
              cx={ this.getSvgX(point.x) }
              cy={ this.getSvgY(point.y) }
              onMouseEnter={ (e) => this.props.onPointHover(point, e.target) }
              onMouseLeave={ (e) => this.props.onPointHover(null, null) }
            />
          )
        })
        )}
      </g>
    )
  }

  render() {
    const {
      className,
      noarea,
      noaxis,
      nodata,
      nogrid,
      nolabel,
      nopath,
      nopoint,
      onClick,
      viewBoxHeight,
      viewBoxWidth,
      yLabelsWidth,
    } = this.props;

    return (
      <svg
        className={ classNames('linechart', (!nolabel || !nopoint) && 'linechart-withPadding', className) }
        viewBox={ `0 0 ${viewBoxWidth} ${viewBoxHeight}` }
      >
        <g transform={`translate(${!nolabel ? yLabelsWidth : 0}, 0)`}>
          { !nogrid ? this.getGrid() : null }
          { !noaxis ? this.getAxis() : null }
          { !nolabel ? this.getLabels() : null }
          { !nopath ? this.getPath() : null }
          { !noarea ? this.getArea() : null }
          { !nopoint ? this.getPoints() : null }
        </g>
      </svg>
    )
  }
}

LineChart.defaultProps = {
  activePoint: {
    x: null,
    y: null
  },
  data1: [],
  data2: [],
  hoveredPointRadius: 6,
  noarea: false,
  noaxis: false,
  nogrid: false,
  nolabel: false,
  nopath: false,
  nopoint: false,
  onPointHover: () => {},
  pointRadius: 4,
  viewBoxHeight: 300,
  viewBoxWidth: 800,
  yLabelsNb: 5,
  yLabelsWidth: 40,
  nogridX: false,
  nogridY: false,
  noaxiX: false,
  noaxiYl: false,
  noaxiYr: false
};

LineChart.propTypes = {
  activePoint: shape({
    x: number,
    y: number
  }),
  data1: arrayOf(shape({
    x: number,
    y: number
  })).isRequired,
  data2: arrayOf(shape({
    x: number,
    y: number
  })).isRequired,
  formatX: func,
  formatY: func,
  hoveredPointRadius: number,
  noarea: bool,
  noaxis: bool,
  nogrid: bool,
  nolabel: bool,
  nopath: bool,
  nopoint: bool,
  onPointHover: func,
  pointRadius: number,
  viewBoxHeight: number,
  viewBoxWidth: number,
  yLabelsNb: number,
  yLabelsWidth: number
};
