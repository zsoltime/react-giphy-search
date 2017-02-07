const createURL = (url, params) => {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');

  return `${url}?${query}`;
}

const Image = (props) => {
  if (!props.src) {
    return (<div />)
  }
  const src = props.type === 'still'
    ? props.src.downsized_still.url
    : props.src.fixed_width.url;

  return (
    <img
      className="results__image"
      src={src}
      alt=""
    />
  );
};

Image.propTypes = {
  src: React.PropTypes.objectOf(React.PropTypes.any).isRequired,
  type: React.PropTypes.string,
};

const Images = (props) => {
  console.log(props.images);
  let imageList;

  if (props.images.length === 0) {
    imageList = (
      <div className="results__wrapper results__wrapper--no-results">
        No results...
      </div>
    );
  } else {
    imageList = props.images
      .map(x => x.images)
      .map(images => (
        <div className="results__wrapper" key={images.id}>
          <Image
            src={images}
            type="still"
          />
        </div>
      ));
  }

  return (
    <section className="results">
      {imageList}
    </section>
  );
};

Images.propTypes = {
  images: React.PropTypes.arrayOf(
    React.PropTypes.object
  ),
};

const SearchForm = props => (
  <section className="search">
    <form
      className="search__form"
      onSubmit={e => e.preventDefault()}
    >
      <input
        className="search__field"
        type="text"
        name="search"
        placeholder="Search..."
        onChange={props.handleChange}
      />
    </form>
  </section>
);

SearchForm.propTypes = {
  handleChange: React.PropTypes.func.isRequired,
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      search: null,
      images: [],
      total: 0,
      timeoutId: 0,
      pageSize: 10,
      activePage: 0,
      isLoaded: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.fetchImages = this.fetchImages.bind(this);
  }
  componentDidMount() {
    this.fetchTrendingImages();
  }
  componentDidUpdate() {}
  fetchImages(query) {
    const url = 'http://api.giphy.com/v1/gifs/search';
    const settings = {
      q: query,
      api_key: 'dc6zaTOxFJmzC',
      // should load more than pageSize to preload images ?
      limit: this.state.pageSize,
      offset: 0,
    };

    fetch(createURL(url, settings))
    .then(res => res.json())
    .then((res) => {
      this.setState({
        images: res.data,
        total: res.pagination.count,
      });
    })
    .catch(err => console.error(err));
  }
  fetchTrendingImages() {
    const url = 'http://api.giphy.com/v1/gifs/trending';
    const settings = {
      api_key: 'dc6zaTOxFJmzC',
      limit: this.state.pageSize,
    };
    fetch(createURL(url, settings))
    .then(res => res.json())
    .then((res) => {
      this.setState({
        images: res.data,
        total: res.pagination.count,
      });
    })
    .catch(err => console.error(err));
  }
  handleChange(event) {
    clearTimeout(this.state.timeoutId);
    const query = encodeURIComponent(event.target.value);
    // debounce calls
    const timeoutId = setTimeout(() => this.fetchImages(query), 1000);
    this.setState({
      [event.target.name]: query,
      timeoutId,
    });
  }
  render() {
    return (
      <div className="container">
        <header className="page-header">
          <h1 className="page-title">Giphy API</h1>
        </header>
        <SearchForm handleChange={this.handleChange} />
        <Images images={this.state.images} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
