class Fedora3Ingestor
  @queue = :ingests

  def self.perform(dir)
    handler = self.new(dir)
    handler.run
  end

  def initialize(dir)
    @job = Job.new(dir)
    @category = Category.new(File.dirname(dir))
    @logger = Logger.new(dir + '/ingest.log')
  end

  def add_datastreams_to_page(page, image_data)
    image = Image.new("#{@job.dir}/#{page.filename}")
    @logger.info "Ingesting MASTER datastream"
    image_data.add_image_datastream image.filename, 'MASTER', 'image/tiff'
    @logger.info "Ingesting MASTER metadata"
    image_data.add_master_metadata_datastream
    image.sizes.keys.each do |size|
      @logger.info "Ingesting #{size} datastream"
      image_data.add_image_datastream image.derivative(size), size, 'image/jpeg'
    end
    if (@category.supports_ocr)
      @logger.info "TODO: OCR support"
    end
  end

  def add_pages(page_list)
    order = @job.metadata.order.pages
    order.each_with_index do |page, i|
      @logger.info "Adding #{i+1} of #{order.length} - #{page.filename}"
      image_data = build_page page_list, page, i+1
      add_datastreams_to_page page, image_data
    end
  end

  def build_page(page_list, page, number)
    image_data = Fedora3Object.from_next_pid
    image_data.parent_pid = page_list.pid
    image_data.model_type = 'ImageData'
    image_data.title = page.label
    @logger.info "Creating Image Object #{image_data.pid}"

    image_data.core_ingest('I')
    image_data.data_ingest
    image_data.image_data_ingest

    image_data.add_sequence_relationship page_list.pid, number

    image_data
  end

  def build_page_list(resource)
    page_list = Fedora3Object.from_next_pid
    page_list.logger = @logger
    page_list.parent_pid = resource.pid
    page_list.model_type = "ListCollection"
    page_list.title = "Page List"
    @logger.info "Creating Page List Object #{resource.pid}"

    page_list.core_ingest("I")
    page_list.collection_ingest
    page_list.list_collection_ingest

    page_list
  end

  def build_resource(holding_area)
    resource = Fedora3Object.from_next_pid
    resource.logger = @logger
    resource.parent_pid = holding_area.pid
    resource.model_type = "ResourceCollection"
    resource.title = "Incomplete... / Processing..."
    @logger.info "Creating Resource Object #{resource.pid}"

    resource.core_ingest("I")
    resource.collection_ingest
    resource.resource_collection_ingest

    resource
  end

  def run
    @logger.info "Beginning ingest."

    holding_area = Fedora3Object.from_pid(@category.target_collection_id)
    rels = Fedora3Relsext.new(holding_area.datastream_dissemination('RELS-EXT'))
    if (rels.sort == "custom")
      raise "TODO: implement custom sort support."
    else
      member_position = 0
    end

    resource = build_resource(holding_area)

    if (member_position > 0)
      raise "TODO: deal with ordered collection sequence numbers"
    end

    page_list = build_page_list(resource)

    add_pages page_list

    @logger.info "Done."
  end
end